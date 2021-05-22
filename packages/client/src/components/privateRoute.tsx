/* eslint-disable react/jsx-props-no-spreading */

import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";

import { usePortalStore } from "../store";

const PrivateRoute: React.FC<RouteProps> = ({ component: Component, ...rest }) => {
  const [client] = usePortalStore((state) => state.myself);
  const { name, uid } = client || { name: null, uid: null };

  return (
    <Route
      {...rest}
      render={() => (
        (!name || !uid)
          ? <Redirect to="/login" />
          // @ts-ignore
          : <Component />
      )}
    />
  );
};

export default PrivateRoute;
