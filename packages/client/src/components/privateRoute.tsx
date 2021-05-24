/* eslint-disable react/jsx-props-no-spreading */

import React from "react";
import { Route, RouteProps, Redirect } from "react-router-dom";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import LinearProgress from "@material-ui/core/LinearProgress";
import Typography from "@material-ui/core/Typography";

import SignalCellular4BarTwoTone from "@material-ui/icons/SignalCellular4BarTwoTone";
import SignalCellularOffTwoTone from "@material-ui/icons/SignalCellularOffTwoTone";

import PortalContext from "../services/portalService";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    position: "relative",
    flex: "1 0 0px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    minWidth: 640,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
}));

const PrivateRoute: React.FC<RouteProps> = ({ component: Component, ...rest }) => {
  const { error, connected, tryReconnect, myself } = React.useContext(PortalContext);
  const classes = useStyles();

  const name = React.useMemo(() => (myself && "name" in myself && myself.name) || null, [myself]);
  const uid = React.useMemo(() => (myself && "uid" in myself && myself.uid) || 0, [myself]);

  return (
    <Route
      {...rest}
      render={() => (
        (!name || !uid)
          ? (tryReconnect)
            ? (
              <div className={classes.root}>
                <Typography variant="h1" color="primary" noWrap gutterBottom>Particle Fight</Typography>
                <Card className={classes.card} variant="elevation">
                  <CardHeader
                    avatar={
                      <Avatar className={classes.avatar}>?</Avatar>
                    }
                    action={
                      connected
                        ? <SignalCellular4BarTwoTone color="primary" />
                        : <SignalCellularOffTwoTone color="error" />
                    }
                    title="Try to reconnect"
                  />
                  {
                    (!error && (
                      <CardContent>
                        <Typography>
                          Recover connection to server - please wait!
                        </Typography>
                        <LinearProgress />
                      </CardContent>
                    )) || null
                  }
                  {
                    error && (
                      <CardContent>
                        <Typography color="error">{`Error: ${error.message}`}</Typography>
                      </CardContent>
                    )
                  }
                </Card>
              </div>
            )
            : <Redirect to="/login" />
          // @ts-ignore
          : <Component />
      )}
    />
  );
};

export default PrivateRoute;
