FROM node:lts-alpine3.13 as build
WORKDIR /particle-fight

COPY . .
RUN yarn
RUN yarn build

FROM node:lts-alpine3.13
WORKDIR /particle-fight
COPY --from=build /particle-fight/packages/server/dist .
COPY --from=build /particle-fight/packages/server/package.json .
RUN sed -i 's+./dist/server.js+./server.js+g' ./package.json
RUN yarn install --production
EXPOSE 3000
CMD ["node", "--experimental-specifier-resolution=node", "server.js"]
