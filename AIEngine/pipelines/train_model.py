from __future__ import annotations

import argparse
import json
import shutil
import sys
from pathlib import Path
from typing import Any

import matplotlib
import numpy as np
import pandas as pd
import tensorflow as tf
from sklearn.metrics import ConfusionMatrixDisplay, classification_report, confusion_matrix

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

AIENGINE_ROOT = Path(__file__).resolve().parents[1]
SERVICE_SRC = AIENGINE_ROOT / "services" / "career-match" / "src"
if str(SERVICE_SRC) not in sys.path:
    sys.path.insert(0, str(SERVICE_SRC))

from career_match.modeling import (  # noqa: E402
    CareerMatchLoss,
    QualityThresholdCallback,
    adapt_vectorizer,
    build_career_match_model,
    make_text_vectorizer,
)
from career_match.preprocessing import NUMERIC_FEATURES  # noqa: E402

DEFAULT_PROCESSED_DIR = AIENGINE_ROOT / "data" / "processed" / "career-match-v1"
DEFAULT_MODEL_DIR = AIENGINE_ROOT / "models" / "registry" / "career-match" / "v1"


def load_pairs(processed_dir: Path, split: str) -> pd.DataFrame:
    path = processed_dir / f"{split}_pairs.csv"
    if not path.exists():
        raise FileNotFoundError(f"Missing {path}. Run preprocess_jobs.py first.")
    frame = pd.read_csv(path)
    frame["candidate_text"] = frame["candidate_text"].fillna("").astype(str)
    frame["job_text"] = frame["job_text"].fillna("").astype(str)
    frame["label"] = frame["label"].astype("float32")
    return frame


def make_dataset(frame: pd.DataFrame, batch_size: int, shuffle: bool, seed: int) -> tf.data.Dataset:
    inputs = {
        "candidate_text": frame["candidate_text"].to_numpy(dtype=str),
        "job_text": frame["job_text"].to_numpy(dtype=str),
        "numeric_features": frame[NUMERIC_FEATURES].to_numpy(dtype="float32"),
    }
    labels = frame["label"].to_numpy(dtype="float32")
    dataset = tf.data.Dataset.from_tensor_slices((inputs, labels))
    if shuffle:
        dataset = dataset.shuffle(buffer_size=len(frame), seed=seed, reshuffle_each_iteration=True)
    return dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)


def reset_metrics(metrics: list[tf.keras.metrics.Metric]) -> None:
    for metric in metrics:
        metric.reset_state()


def metric_result(metrics: list[tf.keras.metrics.Metric], prefix: str = "") -> dict[str, float]:
    return {f"{prefix}{metric.name}": float(metric.result().numpy()) for metric in metrics}


def train_one_epoch(
    model: tf.keras.Model,
    dataset: tf.data.Dataset,
    optimizer: tf.keras.optimizers.Optimizer,
    loss_fn: CareerMatchLoss,
    metrics: list[tf.keras.metrics.Metric],
) -> dict[str, float]:
    reset_metrics(metrics)
    for batch_inputs, y_true in dataset:
        with tf.GradientTape() as tape:
            y_pred = model(batch_inputs, training=True)
            loss = loss_fn(y_true, y_pred)
            if model.losses:
                loss = loss + tf.add_n(model.losses)
        gradients = tape.gradient(loss, model.trainable_variables)
        optimizer.apply_gradients(zip(gradients, model.trainable_variables))
        for metric in metrics:
            if metric.name == "loss":
                metric.update_state(loss)
            else:
                metric.update_state(y_true, y_pred)
    return metric_result(metrics)


def evaluate(
    model: tf.keras.Model,
    dataset: tf.data.Dataset,
    loss_fn: CareerMatchLoss,
    metrics: list[tf.keras.metrics.Metric],
    *,
    prefix: str,
) -> dict[str, float]:
    reset_metrics(metrics)
    for batch_inputs, y_true in dataset:
        y_pred = model(batch_inputs, training=False)
        loss = loss_fn(y_true, y_pred)
        for metric in metrics:
            if metric.name == "loss":
                metric.update_state(loss)
            else:
                metric.update_state(y_true, y_pred)
    return metric_result(metrics, prefix=prefix)


def write_scalars(writer: tf.summary.SummaryWriter, values: dict[str, float], epoch: int) -> None:
    with writer.as_default():
        for name, value in values.items():
            tf.summary.scalar(name, value, step=epoch)
        writer.flush()


def save_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def make_inputs(frame: pd.DataFrame) -> dict[str, Any]:
    return {
        "candidate_text": tf.constant(frame["candidate_text"].astype(str).tolist(), dtype=tf.string),
        "job_text": tf.constant(frame["job_text"].astype(str).tolist(), dtype=tf.string),
        "numeric_features": frame[NUMERIC_FEATURES].to_numpy(dtype="float32"),
    }


def save_classification_artifacts(
    model: tf.keras.Model,
    frame: pd.DataFrame,
    model_dir: Path,
    *,
    batch_size: int,
) -> dict[str, Any]:
    y_true = frame["label"].astype(int).to_numpy()
    y_score = model.predict(make_inputs(frame), batch_size=batch_size, verbose=0).reshape(-1)
    y_pred = (y_score >= 0.5).astype(int)
    target_names = ["not_match", "match"]

    report = classification_report(
        y_true,
        y_pred,
        labels=[0, 1],
        target_names=target_names,
        output_dict=True,
        zero_division=0,
    )
    report_text = classification_report(
        y_true,
        y_pred,
        labels=[0, 1],
        target_names=target_names,
        zero_division=0,
    )

    report_rows = pd.DataFrame(report).transpose().reset_index(names="label")
    report_rows.to_csv(model_dir / "classification_report.csv", index=False)
    (model_dir / "classification_report.txt").write_text(report_text, encoding="utf-8")
    save_json(model_dir / "classification_report.json", report)

    predictions = frame[["job_id", "job_title", "source", "role_family", "label"]].copy()
    predictions["predicted_label"] = y_pred
    predictions["match_probability"] = y_score
    predictions.to_csv(model_dir / "test_predictions.csv", index=False)

    numeric_report = report_rows.copy()
    for column in ["precision", "recall", "f1-score"]:
        if column in numeric_report:
            numeric_report[column] = numeric_report[column].map(lambda value: "" if pd.isna(value) else f"{float(value):.3f}")
    if "support" in numeric_report:
        numeric_report["support"] = numeric_report["support"].map(lambda value: "" if pd.isna(value) else f"{float(value):.0f}")

    fig, ax = plt.subplots(figsize=(8, 3.8))
    ax.axis("off")
    table = ax.table(
        cellText=numeric_report.fillna("").values,
        colLabels=numeric_report.columns,
        loc="center",
        cellLoc="center",
    )
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 1.35)
    ax.set_title("Classification Report - Test Set", fontweight="bold", pad=14)
    fig.tight_layout()
    fig.savefig(model_dir / "classification_report.png", dpi=180, bbox_inches="tight")
    plt.close(fig)

    matrix = confusion_matrix(y_true, y_pred, labels=[0, 1])
    disp = ConfusionMatrixDisplay(confusion_matrix=matrix, display_labels=target_names)
    fig, ax = plt.subplots(figsize=(5, 4))
    disp.plot(ax=ax, cmap="Blues", values_format="d", colorbar=False)
    ax.set_title("Confusion Matrix - Test Set", fontweight="bold")
    fig.tight_layout()
    fig.savefig(model_dir / "confusion_matrix.png", dpi=180, bbox_inches="tight")
    plt.close(fig)

    return {
        "classification_report_csv": str(model_dir / "classification_report.csv"),
        "classification_report_png": str(model_dir / "classification_report.png"),
        "confusion_matrix_png": str(model_dir / "confusion_matrix.png"),
        "test_predictions_csv": str(model_dir / "test_predictions.csv"),
    }


def run_training(args: argparse.Namespace) -> dict[str, Any]:
    tf.keras.utils.set_random_seed(args.seed)
    np.random.seed(args.seed)

    train_frame = load_pairs(args.processed_dir, "train")
    val_frame = load_pairs(args.processed_dir, "val")
    test_frame = load_pairs(args.processed_dir, "test")

    vectorizer = make_text_vectorizer(max_tokens=args.max_tokens, sequence_length=args.sequence_length)
    text_corpus = np.concatenate(
        [
            train_frame["candidate_text"].to_numpy(dtype=str),
            train_frame["job_text"].to_numpy(dtype=str),
        ]
    )
    adapt_vectorizer(vectorizer, text_corpus, batch_size=args.batch_size)

    model = build_career_match_model(
        vectorizer,
        numeric_feature_count=len(NUMERIC_FEATURES),
        embedding_dim=args.embedding_dim,
        dropout=args.dropout,
    )
    loss_fn = CareerMatchLoss()
    optimizer = tf.keras.optimizers.Adam(learning_rate=args.learning_rate)

    train_dataset = make_dataset(train_frame, args.batch_size, shuffle=True, seed=args.seed)
    val_dataset = make_dataset(val_frame, args.batch_size, shuffle=False, seed=args.seed)
    test_dataset = make_dataset(test_frame, args.batch_size, shuffle=False, seed=args.seed)

    train_metrics = [
        tf.keras.metrics.Mean(name="loss"),
        tf.keras.metrics.BinaryAccuracy(name="binary_accuracy", threshold=0.5),
        tf.keras.metrics.MeanAbsoluteError(name="mae"),
    ]
    eval_metrics = [
        tf.keras.metrics.Mean(name="loss"),
        tf.keras.metrics.BinaryAccuracy(name="binary_accuracy", threshold=0.5),
        tf.keras.metrics.MeanAbsoluteError(name="mae"),
    ]

    args.model_dir.mkdir(parents=True, exist_ok=True)
    tensorboard_dir = args.model_dir / "tensorboard"
    if tensorboard_dir.exists():
        shutil.rmtree(tensorboard_dir)
    train_writer = tf.summary.create_file_writer(str(tensorboard_dir / "train"))
    val_writer = tf.summary.create_file_writer(str(tensorboard_dir / "validation"))

    threshold_callback = QualityThresholdCallback(
        target_accuracy=args.min_accuracy,
        target_mae=args.max_mae,
        min_epochs=args.min_epochs,
    )
    threshold_callback.set_model(model)
    threshold_callback.on_train_begin()

    history: list[dict[str, float]] = []
    model.stop_training = False
    for epoch in range(1, args.epochs + 1):
        train_logs = train_one_epoch(model, train_dataset, optimizer, loss_fn, train_metrics)
        val_logs = evaluate(model, val_dataset, loss_fn, eval_metrics, prefix="val_")
        logs = {**train_logs, **val_logs}
        history.append({"epoch": float(epoch), **logs})
        write_scalars(train_writer, train_logs, epoch)
        write_scalars(val_writer, val_logs, epoch)
        threshold_callback.on_epoch_end(epoch - 1, logs)

        print(
            "epoch={epoch:02d} loss={loss:.5f} acc={acc:.4f} mae={mae:.5f} "
            "val_loss={val_loss:.5f} val_acc={val_acc:.4f} val_mae={val_mae:.5f}".format(
                epoch=epoch,
                loss=train_logs["loss"],
                acc=train_logs["binary_accuracy"],
                mae=train_logs["mae"],
                val_loss=val_logs["val_loss"],
                val_acc=val_logs["val_binary_accuracy"],
                val_mae=val_logs["val_mae"],
            )
        )
        if model.stop_training:
            break

    test_logs = evaluate(model, test_dataset, loss_fn, eval_metrics, prefix="test_")
    history_frame = pd.DataFrame(history)
    history_frame.to_csv(args.model_dir / "training_history.csv", index=False)

    model_path = args.model_dir / "career_match_model.keras"
    if model_path.exists():
        model_path.unlink()
    model.save(model_path)

    saved_model_dir = args.model_dir / "saved_model"
    if saved_model_dir.exists():
        shutil.rmtree(saved_model_dir)
    model.export(str(saved_model_dir))

    catalog_source = args.processed_dir / "jobs_catalog.json"
    if catalog_source.exists():
        shutil.copy2(catalog_source, args.model_dir / "jobs_catalog.json")

    evaluation_artifacts = save_classification_artifacts(
        model,
        test_frame,
        args.model_dir,
        batch_size=args.batch_size,
    )

    vocabulary_path = args.model_dir / "vectorizer_vocabulary.txt"
    vocabulary_path.write_text("\n".join(vectorizer.get_vocabulary()), encoding="utf-8")

    metrics = {
        "train": {key: value for key, value in history[-1].items() if key in {"loss", "binary_accuracy", "mae"}},
        "validation": {
            key.removeprefix("val_"): value
            for key, value in history[-1].items()
            if key.startswith("val_")
        },
        "test": {key.removeprefix("test_"): value for key, value in test_logs.items()},
        "thresholds": {
            "min_accuracy": args.min_accuracy,
            "max_mae": args.max_mae,
        },
        "threshold_callback_reached_epoch": threshold_callback.reached_epoch,
    }

    metadata = {
        "model_name": "cakapkarier_career_matcher",
        "version": "v1",
        "framework": "TensorFlow/Keras",
        "architecture": "Functional API dual text encoder plus numeric readiness features",
        "custom_components": [
            "CosineSimilarityLayer",
            "AbsoluteDifferenceLayer",
            "CareerMatchLoss",
            "QualityThresholdCallback",
            "tf.GradientTape custom training loop",
        ],
        "numeric_features": NUMERIC_FEATURES,
        "model_path": str(model_path),
        "saved_model_dir": str(saved_model_dir),
        "tensorboard_dir": str(tensorboard_dir),
        "evaluation_artifacts": evaluation_artifacts,
        "metrics": metrics,
    }
    save_json(args.model_dir / "metrics.json", metrics)
    save_json(args.model_dir / "metadata.json", metadata)

    test_accuracy = metrics["test"]["binary_accuracy"]
    test_mae = metrics["test"]["mae"]
    if not args.skip_threshold_check and (test_accuracy < args.min_accuracy or test_mae > args.max_mae):
        raise SystemExit(
            f"Model did not meet thresholds: accuracy={test_accuracy:.4f}, mae={test_mae:.5f}. "
            f"Required accuracy>={args.min_accuracy:.2f}, mae<={args.max_mae:.2f}."
        )

    print(json.dumps(metrics, ensure_ascii=False, indent=2))
    return metadata


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train CakapKarier TensorFlow career matching model.")
    parser.add_argument("--processed-dir", type=Path, default=DEFAULT_PROCESSED_DIR)
    parser.add_argument("--model-dir", type=Path, default=DEFAULT_MODEL_DIR)
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--min-epochs", type=int, default=5)
    parser.add_argument("--batch-size", type=int, default=64)
    parser.add_argument("--learning-rate", type=float, default=0.0015)
    parser.add_argument("--max-tokens", type=int, default=8000)
    parser.add_argument("--sequence-length", type=int, default=160)
    parser.add_argument("--embedding-dim", type=int, default=96)
    parser.add_argument("--dropout", type=float, default=0.18)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--min-accuracy", type=float, default=0.85)
    parser.add_argument("--max-mae", type=float, default=0.02)
    parser.add_argument("--skip-threshold-check", action="store_true")
    return parser.parse_args()


def main() -> None:
    run_training(parse_args())


if __name__ == "__main__":
    main()
