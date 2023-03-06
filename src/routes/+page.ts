// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const prerender = true;
import { Manager } from 'socket.io-client';

class IxClient {
	url: string;
	username: string;
	password: string;
	data_logging?: boolean;
	manager: Manager;
	socket: any;
	isConnected: boolean;
	emitPath: string;

	constructor(url: string, username: string, password: string, data_logging = false) {
		this.url = url;
		this.username = username;
		this.password = password;
		this.data_logging = data_logging;
		this.isConnected = false;
		this.emitPath = '';
		this.manager = new Manager(url, {
			path: '/internal/ws',
			reconnectionDelay: 0
		});
	}

	connect(relationID?: string) {
		this.emitPath = 'xapp_local_emit';
		type Auth = { [key: string]: string };
		const auth: Auth = { ix_username: this.username, ix_password: this.password };
		if (relationID) {
			this.emitPath = 'xapp_relation_emit';
			auth.relation_id = relationID;
		}
		this.socket = this.manager.socket('', { auth: auth });
		this.socket.on('connect', () => {
			console.log(this.socket.connected);
			this.isConnected = true;
		});
		this.socket.on('disconnect', () => {
			console.log(this.socket.connected); // false
			this.isConnected = false;
		});
		this.socket.on('connect_error', (message: string) => {
			console.log(message); // false
		});
	}

	disconnect() {
		if (this.isConnected) {
			this.socket.disconnect();
		}
	}

	send(data: object) {
		if (!this.isConnected) {
			console.log('Please connect before sending data.');
			return;
		}
		if (!data) {
			console.log('Data cannot be empty. Please send a valid dict.');
			return;
		}
		if (this.data_logging) {
			console.log(`Sending ${data}`);
		}
		this.socket.emit(this.emitPath, data);
	}
}
// export { IxClient };

const client = new IxClient('http://10.68.123.112:31234', 'xapp_test_1', '5iqEwwTbPorYY3438Y4vQA');
client.connect();
