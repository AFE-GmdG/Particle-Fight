import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
// import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import PlayerList from "../components/portal/playerList";

const useStyles = makeStyles((_theme: Theme) => createStyles({
  slash: {
    position: "relative",
    flex: "1 0 0px",
  },
}));

const Slash: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.slash} spacing={1}>
      <Grid item md={9}>
        <Typography>Foo</Typography>
      </Grid>
      <Grid item md={3}>
        <PlayerList />
      </Grid>
    </Grid>
  );
};

export default Slash;
