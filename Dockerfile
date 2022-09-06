ARG DOCKER_REGISTRY_MIRROR=""

FROM ${DOCKER_REGISTRY_MIRROR}centos:nodejs-12.13.0 as builder
COPY . /home/node/proj
#WORKDIR /home/node/proj/modules-library
#RUN npm config set registry https://registry.npmmirror.com/
#RUN npm install --registry=https://registry.npmmirror.com/ --sass_binary_site=https://npmmirror.com/mirrors/node-sass/ --unsafe-perm
#RUN npm rebuild node-sass
#RUN npm run build
WORKDIR /home/node/proj
RUN npm install --registry=https://registry.npmmirror.com/  --sass_binary_site=https://npmmirror.com/mirrors/node-sass/ --unsafe-perm
RUN npm rebuild node-sass
#RUN npm link modules-library
RUN npm run build-aliyun-oss

FROM ${DOCKER_REGISTRY_MIRROR}nginx:1.14.2-alpine
WORKDIR /export
COPY  ./dist    /export/remote
RUN mkdir -p /export/static/ &&  echo '811b40ed913193cdcffe3fbac399863f' > /export/static/Ds4bVSXyzo.txt && echo "4f182b215fa9604ac93b79b6f8064ef0" > /export/static/aVe8G3rc2s.txt && echo 'EdGGloL74vLwgOzm' > /export/static/MP_verify_EdGGloL74vLwgOzm.txt && echo '89cc97c0a9c8006102fca9ef66f1309f' > /export/static/pS0oSJYVhv.txt && echo 'b80c346f9604174fd70a6f2fcb50a33a' > /export/static/PE28vhmr2F.txt && echo "mgDrSNM9vc4a0ZZ6" > /export/static/MP_verify_mgDrSNM9vc4a0ZZ6.txt && echo "b80c346f9604174fd70a6f2fcb50a33a" > /export/static/PE28vhmr2F.txt   && echo "5048f2dff87c5c4f3a7979189c7f46f4"  >  /export/static/4813766827.txt
RUN  sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update && apk add curl
ENV TSURL ${TSURL}
EXPOSE 80
STOPSIGNAL SIGTERM
#CMD ["nginx", "-g", "daemon off;"]
CMD [ "/bin/sh", "-c", "(sleep 10; curl -v ${TSURL})& exec nginx -g \"daemon off;\"" ]
