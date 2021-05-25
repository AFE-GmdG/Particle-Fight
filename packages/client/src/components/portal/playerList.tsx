import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import PortalContext from "../../services/portalService";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    position: "relative",
    height: `calc(100% - ${theme.spacing(2)}px)`,
    padding: theme.spacing(1, 2),
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    backgroundColor: theme.palette.background.paper,
  },
}));

const PlayerList: React.FC = () => {
  const mounted = React.useRef(false);
  // Handle mounted reference
  React.useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const classes = useStyles();
  const { myself, knownClients } = React.useContext(PortalContext);

  return (
    <Paper className={classes.root} elevation={3}>
      {
        myself && "name" in myself && (
          <Typography variant="h6">{`${myself.name}#${myself.uid}`}</Typography>
        )
      }
      <ul>
        {
          knownClients.map((client) => (
            <li key={`${client.name}#${client.uid}`}>
              <Typography>{`${client.name}#${client.uid}`}</Typography>
            </li>
          ))
        }
      </ul>
    </Paper>
  );
};

export default PlayerList;
