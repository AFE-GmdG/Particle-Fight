import React from "react";

import { createStyles, makeStyles } from "@material-ui/core/styles";
// import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";

import GlobalChat from "../components/portal/globalChat";
import PlayerList from "../components/portal/playerList";

const useStyles = makeStyles(() => createStyles({
  slash: {
    position: "relative",
    flex: "1 0 0px",
  },
  container3d: {
    perspective: 1024,
    transformStyle: "preserve-3d",
  },
}));

const Slash: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.slash} spacing={2}>
      <Grid item md={9} className={classes.container3d}>
        <GlobalChat />
      </Grid>
      <Grid item md={3}>
        <PlayerList />
      </Grid>
    </Grid>
  );
};

export default Slash;
