import React from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
// import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";

import { ChatMessage } from "../../models/portalChat";
import { Myself } from "../../models/portalClient";

const useStyles = makeStyles((theme: Theme) => createStyles({
  listItem: {
    width: "auto",
    maxWidth: "80%",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  myself: {
    alignSelf: "flex-end",
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

  const classes = useStyles();

  return (
    <ListItem className={`${classes.listItem} ${isMyself ? classes.myself : ""}`}>
      <ListItemText primary={message.messageText} />
    </ListItem>
  );
};

export default ChatMessageItem;
