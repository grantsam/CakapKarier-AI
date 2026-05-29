from __future__ import annotations

import tensorflow as tf

from .preprocessing import NUMERIC_FEATURES

keras = tf.keras


@keras.utils.register_keras_serializable(package="CakapKarier")
class CosineSimilarityLayer(keras.layers.Layer):
    """Computes cosine similarity between two dense text embeddings."""

    def call(self, inputs, **kwargs):  # type: ignore[override]
        left, right = inputs
        left = tf.math.l2_normalize(left, axis=-1)
        right = tf.math.l2_normalize(right, axis=-1)
        return tf.reduce_sum(left * right, axis=-1, keepdims=True)

    def get_config(self):
        return super().get_config()


@keras.utils.register_keras_serializable(package="CakapKarier")
class AbsoluteDifferenceLayer(keras.layers.Layer):
    """Computes absolute difference between two embedding tensors."""

    def call(self, inputs, **kwargs):  # type: ignore[override]
        left, right = inputs
        return tf.abs(left - right)

    def get_config(self):
        return super().get_config()


@keras.utils.register_keras_serializable(package="CakapKarier")
class CareerMatchLoss(keras.losses.Loss):
    """Focal BCE plus MSE to optimize both accuracy and MAE."""

    def __init__(
        self,
        bce_weight: float = 0.85,
        mse_weight: float = 0.15,
        gamma: float = 1.5,
        name: str = "career_match_loss",
    ):
        super().__init__(name=name)
        self.bce_weight = bce_weight
        self.mse_weight = mse_weight
        self.gamma = gamma

    def call(self, y_true, y_pred):  # type: ignore[override]
        y_true = tf.cast(tf.reshape(y_true, (-1, 1)), tf.float32)
        y_pred = tf.clip_by_value(tf.cast(y_pred, tf.float32), 1e-6, 1.0 - 1e-6)
        bce = -(y_true * tf.math.log(y_pred) + (1.0 - y_true) * tf.math.log(1.0 - y_pred))
        pt = y_true * y_pred + (1.0 - y_true) * (1.0 - y_pred)
        focal_bce = tf.pow(1.0 - pt, self.gamma) * bce
        mse = tf.square(y_true - y_pred)
        return self.bce_weight * tf.reduce_mean(focal_bce) + self.mse_weight * tf.reduce_mean(mse)

    def get_config(self):
        config = super().get_config()
        config.update(
            {
                "bce_weight": self.bce_weight,
                "mse_weight": self.mse_weight,
                "gamma": self.gamma,
            }
        )
        return config


@keras.utils.register_keras_serializable(package="CakapKarier")
class QualityThresholdCallback(keras.callbacks.Callback):
    """Stops the custom loop when validation quality passes project targets."""

    def __init__(
        self,
        target_accuracy: float = 0.85,
        target_mae: float = 0.02,
        min_epochs: int = 4,
    ):
        super().__init__()
        self.target_accuracy = target_accuracy
        self.target_mae = target_mae
        self.min_epochs = min_epochs
        self.reached_epoch: int | None = None

    def on_epoch_end(self, epoch, logs=None):  # type: ignore[override]
        logs = logs or {}
        accuracy = float(logs.get("val_binary_accuracy", 0.0))
        mae = float(logs.get("val_mae", 1.0))
        if epoch + 1 >= self.min_epochs and accuracy >= self.target_accuracy and mae <= self.target_mae:
            self.reached_epoch = epoch + 1
            self.model.stop_training = True

    def get_config(self):
        return {
            "target_accuracy": self.target_accuracy,
            "target_mae": self.target_mae,
            "min_epochs": self.min_epochs,
        }


def make_text_vectorizer(max_tokens: int = 8000, sequence_length: int = 160) -> keras.layers.TextVectorization:
    return keras.layers.TextVectorization(
        max_tokens=max_tokens,
        output_mode="int",
        output_sequence_length=sequence_length,
        name="career_text_vectorizer",
    )


def adapt_vectorizer(vectorizer: keras.layers.TextVectorization, texts, batch_size: int = 128) -> None:
    dataset = tf.data.Dataset.from_tensor_slices(texts).batch(batch_size)
    vectorizer.adapt(dataset)


def build_career_match_model(
    vectorizer: keras.layers.TextVectorization,
    *,
    numeric_feature_count: int = len(NUMERIC_FEATURES),
    embedding_dim: int = 96,
    dropout: float = 0.18,
) -> keras.Model:
    candidate_text = keras.Input(shape=(), dtype=tf.string, name="candidate_text")
    job_text = keras.Input(shape=(), dtype=tf.string, name="job_text")
    numeric_features = keras.Input(shape=(numeric_feature_count,), dtype=tf.float32, name="numeric_features")

    text_input = keras.Input(shape=(), dtype=tf.string, name="text")
    token_ids = vectorizer(text_input)
    vocab_size = max(len(vectorizer.get_vocabulary()), 2)
    embedded = keras.layers.Embedding(vocab_size, embedding_dim, mask_zero=True, name="token_embedding")(token_ids)
    pooled = keras.layers.GlobalAveragePooling1D(name="masked_average_pooling")(embedded)
    encoded = keras.layers.LayerNormalization(name="text_layer_norm")(pooled)
    encoded = keras.layers.Dense(128, activation="relu", name="text_dense_1")(encoded)
    encoded = keras.layers.Dropout(dropout, name="text_dropout")(encoded)
    encoded = keras.layers.Dense(64, activation="relu", name="text_embedding")(encoded)
    text_encoder = keras.Model(text_input, encoded, name="shared_text_encoder")

    candidate_vector = text_encoder(candidate_text)
    job_vector = text_encoder(job_text)
    cosine = CosineSimilarityLayer(name="cosine_similarity")([candidate_vector, job_vector])
    absolute_diff = AbsoluteDifferenceLayer(name="embedding_abs_diff")([candidate_vector, job_vector])
    product = keras.layers.Multiply(name="embedding_product")([candidate_vector, job_vector])

    merged = keras.layers.Concatenate(name="match_features")(
        [candidate_vector, job_vector, absolute_diff, product, cosine, numeric_features]
    )
    x = keras.layers.Dense(160, activation="relu", name="match_dense_1")(merged)
    x = keras.layers.BatchNormalization(name="match_batch_norm")(x)
    x = keras.layers.Dropout(dropout, name="match_dropout_1")(x)
    x = keras.layers.Dense(80, activation="relu", name="match_dense_2")(x)
    x = keras.layers.Dropout(dropout / 2, name="match_dropout_2")(x)
    output = keras.layers.Dense(1, activation="sigmoid", name="match_score")(x)

    return keras.Model(
        inputs={
            "candidate_text": candidate_text,
            "job_text": job_text,
            "numeric_features": numeric_features,
        },
        outputs=output,
        name="cakapkarier_career_matcher",
    )
