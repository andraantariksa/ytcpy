import React, {ChangeEvent} from 'react';
import {
    AppBar,
    createStyles,
    IconButton,
    Toolbar,
    Typography,
    withStyles,
    WithStyles,
    Button,
    TextField, Grid, Slider
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import {VolumeDown, VolumeUp} from "@material-ui/icons";

type Socket = SocketIOClient.Socket;

const styles = (theme: any) => createStyles({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
    },
});

interface SocketProps extends WithStyles<typeof styles> {
    socket: Socket
}

type AppState = {
    isConnected: boolean,
    socketLog: string,
    volume: number
}

class App extends React.Component<SocketProps, AppState> {
    constructor(props: SocketProps) {
        super(props);

        this.state = {
            isConnected: false,
            volume: 100.0,
            socketLog: ''
        };
    }

    componentDidMount() {
        const socket = this.props.socket;
        socket.emit('play', {
            url: 'https://www.youtube.com/watch?v=-MtcJIZY4yk'
        });

        type VolumeSocketData = {
            value: number
        };
        socket.on('volumeChanged', (data: VolumeSocketData) => {
            this.setState({
                volume: data.value
            });
        });

        type PlaySocketData = {
            url: string
        };

        type LogSocketData = {
            message: string,
            type: string
        };
        socket.on('log', (data: LogSocketData) => {
            let logType: string;
            switch (data.type) {
                case 'info':
                    logType = 'INFO';
                    break;
                case 'error':
                    logType = 'ERROR';
                    break;
                case 'warn':
                    logType = 'WARN';
                    break;
                default:
                    logType = 'UNKNOWN'
            }

            const newLogMessage = `[${logType}] ${data.message}\n`;
            this.setState({
                socketLog: this.state.socketLog + newLogMessage
            });
        });
    }

    pauseV = () => {
        this.props.socket.emit('pause', {});
    }

    resumeV = () => {
        this.props.socket.emit('resume', {});
    }

    volumeChangeV = (event: ChangeEvent<{}>, value: number | number[]) => {
        const newVolumeValue = value as any;
        console.log(newVolumeValue);
        this.setState({
            volume: newVolumeValue
        });
        this.props.socket.emit('volume', {
            value: newVolumeValue
        })
    }

    render() {
        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            News
                        </Typography>
                        <Button color="inherit">{this.state.isConnected ? 'Connected' : 'Disconnected'}</Button>
                    </Toolbar>
                </AppBar>
                <main>
                    <TextField
                        label="Log"
                        multiline
                        rows={10}
                        value={this.state.socketLog}
                        aria-readonly={true}
                        variant="filled"
                    />
                    <Button onClick={this.pauseV}>Pause</Button>
                    <Button onClick={this.resumeV}>Resume</Button>
                    <Typography id="continuous-slider" gutterBottom>
                        Volume
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item>
                            <VolumeDown/>
                        </Grid>
                        <Grid item xs>
                            <Slider
                                value={this.state.volume}
                                max={100.0}
                                min={0.0}
                                onChange={this.volumeChangeV}
                                aria-labelledby="continuous-slider"
                            />
                        </Grid>
                        <Grid item>
                            <VolumeUp/>
                        </Grid>
                    </Grid>
                </main>
            </div>
        );
    }
}

export default withStyles(styles, {withTheme: true})(App);
