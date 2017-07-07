FROM debian:jessie
MAINTAINER huangsuoyuan@xuetangx.com

ENV DEPLOY_DIR /rain
ENV TMP_DIR /tmp/code

COPY . ${TMP_DIR}

RUN mkdir -p ${DEPLOY_DIR}/vue \
    && cp -r ${TMP_DIR}/dist ${DEPLOY_DIR}/vue/ \
    && rm -rf ${TMP_DIR}

CMD ["cp", "-fRp", "/rain/", "/lesson/"]
