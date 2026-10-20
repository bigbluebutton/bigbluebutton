# Pinned environment for the synthetic presentation-conversion fixtures (see run.sh).
FROM python:3.12-slim@sha256:05cda9777409a9c3ffddd94a4c476b79f0769a0b4857f0c7ed9226b6800b0d6f

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONHASHSEED=0 \
    SOURCE_DATE_EPOCH=0 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

COPY requirements.txt /gen/requirements.txt
# Wheels only, except odfpy (pure Python, published as an sdist only).
RUN pip install --root-user-action=ignore --only-binary=:all: --no-binary=odfpy -r /gen/requirements.txt

COPY *.py /gen/
WORKDIR /gen
