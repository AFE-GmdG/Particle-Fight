import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
// import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import { PlayerList } from "../components/portal/playerList";

const useStyles = makeStyles((theme: Theme) => createStyles({
  slash: {
    position: "relative",
    backgroundColor: theme.palette.background.paper,
  },
}));

const Slash: React.FC = () => {
  const classes = useStyles();

  return (
    <Grid container className={classes.slash}>
      <Grid item lg={9}>
        <Typography>Foo</Typography>
      </Grid>
      <Grid item lg={3}>
        <PlayerList />
      </Grid>
    </Grid>
  );
};

export default Slash;
