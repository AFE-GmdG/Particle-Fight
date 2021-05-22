import React from "react";
import { render } from "react-dom";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import { createStyles, makeStyles, Theme, ThemeProvider } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";

import PrivateRoute from "./components/privateRoute";
import Slash from "./views/slash";
import Login from "./views/login";

import muiTheme from "./theme";

const useStyles = makeStyles((theme: Theme) => createStyles({
  "@global": {
    html: {
      height: "100%",
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
      userSelect: "none",
    },
    body: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: "100%",
      overflow: "hidden",
      margin: 0,
    },
    "#app": {
      position: "relative",
      flex: "1 0 0px",
      display: "flex",
      flexDirection: "column",
    },
  },
  content: {
    backgroundColor: theme.palette.background.default,
    position: "relative",
    flex: "1 0 0px",
    padding: theme.spacing(2),
  },
}));

const App: React.FC = () => {
  const classes = useStyles();

  return (
    <ThemeProvider theme={muiTheme}>
      <BrowserRouter>
        <Box className={classes.content}>
          <Switch>
            <Route path="/login" component={Login} />
            <PrivateRoute path="/" exact component={Slash} />
          </Switch>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
};

render(
  <App />,
  document.getElementById("app"),
);
