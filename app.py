from flask import Flask, render_template

import mpv
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

player: mpv.MPV = mpv.MPV(ytdl=True)


def on_volume_change(_, value: float):
    socketio.emit('volumeChanged', {
        'value': value
    })


player.observe_property("volume", on_volume_change)


@socketio.on('volume', namespace='/command')
def volume_change(data):
    global player
    try:
        player._set_property('volume', data['value'])
        emit('log', {
            'message': f'Volume changed to {data["value"]}',
            'type': 'info'
        })
    except KeyError:
        emit('log', {
            'message': 'No volume value provided',
            'type': 'error'
        })


@socketio.on('play', namespace='/command')
def play(data):
    global player
    try:
        player.play(data['url'])
        emit('play', {
            'url': data['url']
        })
        emit('log', {
            'message': 'Playing',
            'type': 'info'
        })
    except KeyError:
        emit('log', {
            'message': 'No url provided',
            'type': 'error'
        })


@socketio.on('stop', namespace='/command')
def stop():
    global player
    player.stop(keep_playlist=True)
    emit('log', {
        'message': 'Stopped',
        'type': 'info'
    })


@socketio.on('pause', namespace='/command')
def pause(_):
    global player
    player._set_property("pause", True)
    emit('log', {
        'message': 'Paused',
        'type': 'info'
    })


@socketio.on('resume', namespace='/command')
def resume(_):
    global player
    player._set_property("pause", False)
    emit('log', {
        'message': 'Resume',
        'type': 'info'
    })


if __name__ == '__main__':
    socketio.run(app, debug=True)
