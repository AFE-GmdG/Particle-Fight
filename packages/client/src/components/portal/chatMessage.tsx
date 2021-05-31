import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
// import Avatar from "@material-ui/core/Avatar";
import ListItem from "@material-ui/core/ListItem";
// import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";

import { ChatMessage } from "../../models/portalChat";
import { Myself } from "../../models/portalClient";

const useStyles = makeStyles((theme: Theme) => createStyles({
  listItem: {
    width: "auto",
    maxWidth: "80%",
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    alignItems: "flex-start",
    margin: theme.spacing(2.25, 2.5, 0, 2.5),
    padding: theme.spacing(1.25, 2.5, 1, 2.5),
    userSelect: "text",

    "&::before": {
      position: "absolute",
      top: theme.spacing(-2.5),
      left: theme.spacing(-2.5),
      width: 0,
      height: 0,
      padding: theme.spacing(2.5),
      content: "attr(data-avatar-letter)",
      fontFamily: "Hind",
      fontWeight: 300,
      fontSize: "1.66rem",
      borderRadius: "50%",
      backgroundColor: theme.palette.primary.dark,
      color: "transparent",
      textShadow: `-0.55rem -1.2rem ${theme.palette.primary.contrastText}`,
      zIndex: 2,
    },

    "&::after": {
      position: "absolute",
      top: theme.spacing(-1.25),
      left: 0,
      height: 0,
      padding: theme.spacing(1.5, 0.5, 1.5, 3),
      content: "attr(data-avatar-name)",
      fontFamily: "Hind",
      fontWeight: 300,
      fontSize: "1rem",
      borderRadius: `0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0`,
      whiteSpace: "nowrap",
      backgroundColor: theme.palette.primary.dark,
      color: "transparent",
      textShadow: `-0.3rem -0.75rem ${theme.palette.primary.contrastText}`,
      zIndex: 1,
    },

    "&$myself::before": {
      left: "unset",
      right: theme.spacing(-2.5),
      backgroundColor: theme.palette.secondary.dark,
      textShadow: `-0.55rem -1.2rem ${theme.palette.secondary.contrastText}`,
    },

    "&$myself::after": {
      left: "unset",
      right: 0,
      padding: theme.spacing(1.5, 2.25, 1.5, 1.25),
      borderRadius: `${theme.shape.borderRadius}px 0 0 ${theme.shape.borderRadius}px`,
      backgroundColor: theme.palette.secondary.dark,
      textShadow: `-0.3rem -0.75rem ${theme.palette.secondary.contrastText}`,
    },
  },
  myself: {
    alignSelf: "flex-end",
    backgroundColor: theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText,
  },
}));

export type ChatMessageItemProps = {
  myself: Myself;
  message: ChatMessage;
};

const ChatMessageItem: React.FC<ChatMessageItemProps> = (props) => {
  const { myself, message } = props;
  const isMyself = React.useMemo(() => (
    myself.uid === message.sender.uid && myself.name === message.sender.name
  ), [myself, message]);
  const avatarLetter = React.useMemo(() => message.sender.name[0].toUpperCase(), [message]);
  const avatarName = React.useMemo(() => `${message.sender.name}#${message.sender.uid}`, [message]);

  const classes = useStyles();

  return (
    <ListItem className={`${classes.listItem} ${isMyself ? classes.myself : ""}`} data-avatar-letter={avatarLetter} data-avatar-name={avatarName}>
      <ListItemText primary={message.messageText} />
    </ListItem>
  );
};

export default ChatMessageItem;
