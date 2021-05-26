import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import PortalContext from "../../services/portalService";

const useStyles = makeStyles((theme: Theme) => createStyles({
  "@global": {
    "@keyframes swapCard": {
      "0%": {
        transform: "translateZ(0px) rotateY(0deg)",
        animationTimingFunction: "ease-out",
      },
      "25%": {
        transform: "translateZ(-512px) rotateY(0deg)",
        animationTimingFunction: "ease-in-out",
      },
      "75%": {
        transform: "translateZ(-512px) rotateY(180deg)",
        animationTimingFunction: "ease-in",
      },
      "100%": {
        transform: "translateZ(0px) rotateY(180deg)",
      },
    },
  },
  card: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    backgroundColor: theme.palette.background.paper,
    // animation: "swapCard 2s infinite linear",
  },
  cardHeader: {
    flex: "0 0 auto",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  cardContent: {
    flex: "1 0 0px",
  },
  cardActions: {
    flex: "0 0 auto",
    backgroundColor: theme.palette.primary.light,
  },
}));

const GlobalChat: React.FC = () => {
  const mounted = React.useRef(false);
  // Handle mounted reference
  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const { myself } = React.useContext(PortalContext);

  if (!myself || !("name" in myself)) {
    return (
      <Paper className={classes.card} elevation={3}>
        <Typography variant="h6">Please log in.</Typography>
      </Paper>
    );
  }

  return (
    <Card className={classes.card} elevation={3}>
      <CardHeader
        className={classes.cardHeader}
        avatar={<Avatar>PF</Avatar>}
        title={(
          <Typography variant="h4" noWrap>Particle Fight - Global Chat</Typography>
        )}
      />
      <CardContent className={classes.cardContent}>
        <Typography variant="h6">Chat Space</Typography>
      </CardContent>
      <CardActions className={classes.cardActions}>
        <Typography variant="h6">Chat Input</Typography>
      </CardActions>
    </Card>
  );
};

export default GlobalChat;
