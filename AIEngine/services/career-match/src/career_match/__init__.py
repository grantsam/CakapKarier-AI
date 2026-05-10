"""Career matching package for CakapKarier AI."""

__all__ = ["CareerMatchService"]


def __getattr__(name: str):
    if name == "CareerMatchService":
        from .inference import CareerMatchService

        return CareerMatchService
    raise AttributeError(name)
