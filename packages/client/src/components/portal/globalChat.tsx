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
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import EmailTwoTone from "@material-ui/icons/EmailTwoTone";
import MenuTwoTone from "@material-ui/icons/MenuTwoTone";

import ChatMessageItem from "./chatMessage";
import { ChatMessage } from "../../models/portalChat";

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
    display: "flex",
    flexDirection: "column",
    padding: theme.spacing(1, 2, 1, 1),
  },
  chatMessageList: {
    flex: "1 0 0px",
    display: "flex",
    flexDirection: "column-reverse",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    overflowY: "auto",
    gap: theme.spacing(1),
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
  const { loading, error, myself, lastChatMessage, chat } = React.useContext(PortalContext);
  const [chatMessage, setChatMessage] = React.useState("");
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    { messageText: "A story about robots and space ships?", messageTime: 7, sender: { name: "Buster", uid: 2345 } },
    { messageText: "Lame! Didn't you have a better story?", messageTime: 6, sender: { name: "Buster", uid: 2345 } },
    // eslint-disable-next-line max-len
    { messageText: "Once upon a time, in a far, far country there was a princess called Susi. The Princess had a unicorn friend with magic ability, as powerful as you could think about…", messageTime: 5, sender: { name: "John Doe", uid: 6419 } },
    { messageText: "I would like to tell you a story", messageTime: 4, sender: { name: "John Doe", uid: 6419 } },
    { messageText: "Hello, I'm John Doe", messageTime: 3, sender: { name: "John Doe", uid: 6419 } },
    { messageText: "Chat Message #2 also is from Buster.", messageTime: 2, sender: { name: "Buster", uid: 2345 } },
    { messageText: "Chat Message #1 is from Buster", messageTime: 1, sender: { name: "Buster", uid: 2345 } },
  ]);
  const [isBusy, setIsBusy] = React.useState(false);

  React.useEffect(() => {
    if (!lastChatMessage) return;
    setChatMessages((messages) => [
      lastChatMessage,
      ...messages.slice(0, 49),
    ]);
  }, [lastChatMessage]);

  const onChangeChatMessage = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = event.currentTarget.value.slice(0, 200);
    setChatMessage(newMessage);
  }, []);

  const onSendChatMessage = React.useCallback(async () => {
    if (isBusy) return;
    setIsBusy(true);
    await chat(chatMessage);
    if (mounted.current) {
      setChatMessage("");
      setIsBusy(false);
    }
  }, [isBusy, chatMessage]);

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
        <List className={classes.chatMessageList}>
          {
            chatMessages.map((message) => (
              <ChatMessageItem
                key={message.messageTime}
                myself={myself}
                message={message}
              />
            ))
          }
        </List>
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
            disabled={!chatMessage || isBusy}
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
            disabled={isBusy}
          >
            New Game
          </Button>
        </Paper>
      </CardActions>
    </Card>
  );
};

export default GlobalChat;
