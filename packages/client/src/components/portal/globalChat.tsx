import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import EmailTwoTone from "@material-ui/icons/EmailTwoTone";
import MenuTwoTone from "@material-ui/icons/MenuTwoTone";

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
  form: {
    flex: "1 0 0px",
    padding: theme.spacing(0.25, 0.5),
    display: "flex",
    alignItems: "center",
  },
  input: {
    flex: "1 0 0px",
  },
  iconButton: {
    padding: theme.spacing(1),
  },
  divider: {
    height: theme.spacing(4),
    margin: theme.spacing(0.5),
  },
  button: {
    margin: theme.spacing(0, 0.5, 0, 1),
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
  const { loading, error, myself } = React.useContext(PortalContext);
  const [chatMessage, setChatMessage] = React.useState("");

  const onChangeChatMessage = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = event.currentTarget.value.slice(0, 200);
    setChatMessage(newMessage);
  }, []);

  const onSendChatMessage = React.useCallback(async () => {
    // Send Chat
    setChatMessage("");
  }, [chatMessage]);

  const onKeyPressChatMessage = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey || (event.code !== "Enter" && event.code !== "NumpadEnter")) {
      return;
    }
    if (!chatMessage) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    onSendChatMessage();
  }, [chatMessage]);

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
        <Paper component="form" className={classes.form} variant="outlined">
          <IconButton className={classes.iconButton} color="primary">
            <MenuTwoTone />
          </IconButton>
          <InputBase
            className={classes.input}
            placeholder={`${myself.name}#${myself.uid}`}
            disabled={loading || error !== null}
            value={chatMessage}
            autoFocus
            autoComplete="off"
            inputMode="text"
            spellCheck={false}
            onChange={onChangeChatMessage}
            onKeyPress={onKeyPressChatMessage}
          />
          <IconButton
            className={classes.iconButton}
            color="primary"
            onClick={onSendChatMessage}
          >
            <EmailTwoTone />
          </IconButton>
          <Divider className={classes.divider} orientation="vertical" />
          <Button
            className={classes.button}
            variant="contained"
            color="primary"
            size="small"
          >
            New Game
          </Button>
        </Paper>
      </CardActions>
    </Card>
  );
};

export default GlobalChat;
