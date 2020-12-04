"use strict";

const url = 'https://jslabdb.datamola.com/';
// const url = 'http://localhost:3000/';
const keyAuthToken = 'authToken';

const authorizationHeader = () => {
    const token = localStorage.getItem(keyAuthToken);
    if (!token) {
        return {};
    }
    return {
        'authorization': `Bearer ${token}`
    }
}

const login = (name, pass) => {
    console.log('login');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('pass', pass);
    return fetch(url + 'auth/login', {
        method: 'POST',
        body: formData
    }).then((res) => {
        if (res.status === 200) {
            return res.json()
        }
        throw new Error('Invalid login or password')
    })
        .then((data) => {
            localStorage.setItem(keyAuthToken, data.token);
            return Promise.resolve();
        });
};

const register = (name, pass) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('pass', pass);
    return fetch(url + 'auth/register', {
        method: 'POST',
        body: formData
    });
};

const logout = async () => {
    console.log('logout');

    return await fetch(url + 'auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...authorizationHeader()
        },
    });
}

const getMessages = async (skip, top, author, dateFrom, dateTo, text) => {
    const params = {
        skip,
        top,
        author,
        dateFrom,
        dateTo,
        text
    };

    Object.keys(params).forEach((key) => {
        if (!params[key] && params[key] !== 0) {
            delete params[key];
        }
    });
    return await fetch(url + 'messages?' + new URLSearchParams(params), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...authorizationHeader()
        }
    });
};

const addMessage = (text, isPersonal, to) => {
    return fetch(url + 'messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...authorizationHeader()
        },
        body: JSON.stringify({
            text,
            isPersonal,
            to
        })
    });
};

const editMessage = async (id, text, isPersonal, to) => {
    return await fetch(url + 'messages/' + id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...authorizationHeader()
        },
        body: JSON.stringify({
            text,
            isPersonal,
            to
        })
    });
};

const deleteMessage = async (id) => {
    return await fetch(url + 'messages/' + id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...authorizationHeader()
        }
    });
};

const getUsers = async () => {
    return await fetch(url + 'users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8',
            ...authorizationHeader()
        }
    });
};

class Controller {
    constructor() {
        this.users = [];
        this.messages = [];
        this.top = 10;
        this.filters = {};
        this.user = null;
        this.author = document.getElementById('author-filter');
        this.dateFrom = document.getElementById('dateFrom-filter');
        this.dateTo = document.getElementById('dateTo-filter');
        this.text = document.getElementById('text-filter');
        this.usersEl = document.getElementById('users');
        this.messagesEl = document.getElementById('messages');
        this.options = document.getElementById('to');
        this.getUsers();
        this.getMessages();
    }

    login(name, pass) {
        login(name, pass).then(() => {
            document.getElementById('login').value = '';
            document.getElementById('pass').value = '';
            this.user = name;
            document.getElementById('current-user').innerHTML = `Current user: ${name} <button onclick="controller.logout()">Log Out</button>`;
            this.getMessages();
            this.getUsers();
        });
    }

    register(name, pass) {
        register(name, pass).then((res) => {
            if (res.status === 200) {
                document.getElementById('reg-login').value = '';
                document.getElementById('reg-pass').value = '';
                this.getUsers();
            }
        }, (err) => {
            console.log(err);
        })
    }

    logout() {
        logout().then((res) => {
            if (res.status === 200) {
                this.user = null;
                document.getElementById('current-user').innerHTML = `Current user: guest`;
                this.getUsers();
                this.getMessages();
            }
        }, (err) => {
            console.log(err);
        });
    }

    getMessages() {
        getMessages(0, this.top, this.author.value, this.dateFrom.value, this.dateTo.value, this.text.value).then((res) => {
            return res.json();
        }, (err) => {
            console.log(err);
        }).then((res) => {
            this.messages = res;
            let str = '';
            res.forEach((mes) => {
                str += `<li>${JSON.stringify(mes)}</li>`
            });
            this.messagesEl.innerHTML = str;
        });
    }

    getUsers() {
        getUsers().then((res) => {
            return res.json();
        }, (err) => {
            console.log(err);
        }).then((res) => {
            this.users = res;
            let str = '', opt = '';
            res.forEach((user) => {
                str += `<li>${JSON.stringify(user)}</li>`;
                opt += `<option value="${user.name}">${user.name}</option>`;
            })
            this.usersEl.innerHTML = str;
            this.options.innerHTML = opt;

        })
    }

    doAction(text, isPersonal, to, action, messageId) {
        let promise;
        switch (action) {
            case 'add':
                promise = addMessage(text, isPersonal, to);
                break;
            case 'edit':
                promise = editMessage(messageId, text, isPersonal, to);
                break;
            case 'delete':
                promise = deleteMessage(messageId);
                break;
            default:
                return;
        }

        promise.then((res) => {
            this.getMessages();
        }, (err) => {
            console.log(err);
        });

        document.getElementById('text').value = '';
        document.getElementById('message-id').value = '';
    }
}

const controller = new Controller();
