import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import PortalContext from "../../services/portalService";

const useStyles = makeStyles((_theme: Theme) => createStyles({
  root: {
    position: "relative",
  },
}));

const PlayerList: React.FC = () => {
  const mounted = React.useRef(false);
  const classes = useStyles();
  const { myself, knownClients } = React.useContext(PortalContext);

  // Handle mounted reference
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

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
