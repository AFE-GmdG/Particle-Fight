import React from "react";
import { useHistory } from "react-router-dom";

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import LinearProgress from "@material-ui/core/LinearProgress";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import AutorenewTwoTone from "@material-ui/icons/AutorenewTwoTone";
import SignalCellular4BarTwoTone from "@material-ui/icons/SignalCellular4BarTwoTone";
import SignalCellularOffTwoTone from "@material-ui/icons/SignalCellularOffTwoTone";

import PortalContext from "../services/portalService";

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
  cardContent: {
    display: "flex",
    gap: theme.spacing(1),
  },
  nameInput: {
    flex: "1 0 0px",
  },
  uidInput: {
    flex: "0 0 100px",
  },
  loginButton: {
    marginLeft: "auto",
  },
}));

const Login: React.FC = () => {
  const mounted = React.useRef(false);
  const history = useHistory();
  const classes = useStyles();

  const { loading, error, connected, myself, getRandomUid, setName } = React.useContext(PortalContext);

  const [userName, setUserName] = React.useState("");
  const [uid, setUid] = React.useState(0);
  const avatarLetter = React.useMemo(() => (userName && userName[0].toUpperCase()) || "#", [userName]);

  React.useLayoutEffect(() => {
    if (myself !== null && "name" in myself) {
      history.push("/");
    } else if (mounted.current && myself) {
      setUid(myself.uid);
    }
  }, [myself]);

  const onGetNextRandomUidClick = React.useCallback(async () => {
    const newUid = await getRandomUid();
    if (mounted.current) {
      setUid(newUid);
    }
  }, [getRandomUid]);

  const onSetNameClick = React.useCallback(async () => {
    await setName(userName, uid);
  }, [userName, uid, setName]);

  const onUserNameKeyPress = React.useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey || (event.code !== "Enter" && event.code !== "NumpadEnter")) {
      return;
    }
    if (!userName) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    onSetNameClick();
  }, [userName]);

  // Handle mounted reference
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <div className={classes.root}>
      <Typography variant="h1" color="primary" noWrap gutterBottom>Particle Fight</Typography>
      <Card className={classes.card} variant="elevation">
        <CardHeader
          avatar={
            <Avatar className={classes.avatar}>{avatarLetter}</Avatar>
          }
          action={
            connected
              ? <SignalCellular4BarTwoTone color="primary" />
              : <SignalCellularOffTwoTone color="error" />
          }
          title="Set your multiplayer name"
        />
        <CardContent className={classes.cardContent}>
          <TextField
            label="Multiplayer Name"
            value={userName}
            onChange={(e) => setUserName(e.currentTarget.value)}
            onKeyPress={onUserNameKeyPress}
            fullWidth
            disabled={loading || error !== null || !uid}
            InputProps={{
              autoFocus: true,
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <TextField
            label="uid"
            value={uid}
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  #
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton edge="end" onClick={onGetNextRandomUidClick} disabled={loading || error !== null}>
                    <AutorenewTwoTone />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
        {
          (!error && loading && (
            <CardContent>
              <LinearProgress />
            </CardContent>
          )) || null
        }
        {
          error && (
            <CardContent className={classes.cardContent}>
              <Typography color="error">{`Error: ${error.message}`}</Typography>
            </CardContent>
          )
        }
        <CardActions>
          <Button
            className={classes.loginButton}
            variant="contained"
            size="small"
            color="primary"
            onClick={onSetNameClick}
            disabled={loading || error !== null || !userName || !uid}
          >
            Set Name
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};

export default Login;
