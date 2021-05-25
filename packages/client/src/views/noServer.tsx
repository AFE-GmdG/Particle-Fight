import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Typography from "@material-ui/core/Typography";

import SentimentDissatisfiedTwoTone from "@material-ui/icons/SentimentDissatisfiedTwoTone";
import SignalCellularOffTwoTone from "@material-ui/icons/SignalCellularOffTwoTone";

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

const NoServer: React.FC = () => {
  const classes = useStyles();

  React.useEffect(() => {
    localStorage.clear();
  }, []);

  return (
    <div className={classes.root}>
      <Typography variant="h1" color="primary" noWrap gutterBottom>Particle Fight</Typography>
      <Card className={classes.card} variant="elevation">
        <CardHeader
          avatar={
            <Avatar className={classes.avatar}><SentimentDissatisfiedTwoTone /></Avatar>
          }
          action={
            <SignalCellularOffTwoTone color="error" />
          }
          title="Sorry"
        />
        <CardContent>
          <Typography>
            The Particle Fight server was shut down.
          </Typography>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoServer;
