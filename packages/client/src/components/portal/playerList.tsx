import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import ExitToAppTwoTone from "@material-ui/icons/ExitToAppTwoTone";
import SignalCellular4BarTwoTone from "@material-ui/icons/SignalCellular4BarTwoTone";
import SignalCellularOffTwoTone from "@material-ui/icons/SignalCellularOffTwoTone";

import { KnownClient } from "../../models/portalClient";
import PortalContext from "../../services/portalService";

const useStyles = makeStyles((theme: Theme) => createStyles({
  card: {
    position: "relative",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    backgroundColor: theme.palette.background.paper,
  },
  cardHeader: {
    flex: "0 0 auto",
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  listRoot: {
    flex: "1 0 0px",
    backgroundColor: theme.palette.background.default,
    position: "relative",
    overflow: "auto",
  },
  listSection: {
    backgroundColor: "inherit",
  },
  subHeader: {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
  },
  subList: {
    backgroundColor: "inherit",
    padding: 0,
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
  const myAvatarLetter = React.useMemo(() => (myself && "name" in myself && myself.name[0].toUpperCase()) || "#", [myself]);

  const sortClient = React.useCallback((l: KnownClient, r: KnownClient) => {
    if (l === null && r === null) return 0;
    if (l === null) return -1;
    if (r === null) return 1;
    return l.name.localeCompare(r.name);
  }, []);

  const groupedKnownClients = React.useMemo(() => {
    const onlineClients = knownClients.filter((client) => !client.offline).sort(sortClient).map((client) => (
      <ListItem key={`${client.name}#${client.uid}`} button>
        <ListItemAvatar>
          <Avatar>{client.name[0].toUpperCase()}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={`${client.name}#${client.uid}`}
        />
        <ListItemSecondaryAction>
          <SignalCellular4BarTwoTone color="action" />
        </ListItemSecondaryAction>
      </ListItem>
    ));
    const offlineClients = knownClients.filter((client) => client.offline).sort(sortClient).map((client) => (
      <ListItem key={`${client.name}#${client.uid}`} button>
        <ListItemAvatar>
          <Avatar>{client.name[0].toUpperCase()}</Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={`${client.name}#${client.uid}`}
        />
        <ListItemSecondaryAction>
          <SignalCellularOffTwoTone color="error" />
        </ListItemSecondaryAction>
      </ListItem>
    ));
    return {
      onlineClients,
      offlineClients,
    };
  }, [knownClients]);

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
        avatar={<Avatar>{myAvatarLetter}</Avatar>}
        action={(
          <IconButton>
            <ExitToAppTwoTone />
          </IconButton>
        )}
        title="Player List"
        subheader={(
          <Typography variant="subtitle1" noWrap>
            {`${myself.name}#${myself.uid}`}
          </Typography>
        )}
      />
      <List className={classes.listRoot} subheader={<li />}>
        <li className={classes.listSection}>
          <ul className={classes.subList}>
            <ListSubheader className={classes.subHeader}>Online</ListSubheader>
            { groupedKnownClients.onlineClients }
            <ListSubheader className={classes.subHeader}>Offline</ListSubheader>
            { groupedKnownClients.offlineClients }
          </ul>
        </li>
      </List>
    </Card>
  );
};

export default PlayerList;
