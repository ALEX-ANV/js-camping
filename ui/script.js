"use strict";

const url = 'http://localhost:3000/';

const login = async (name, pass) => {
    console.log('login');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('pass', pass);
    return await fetch(url+'auth/login', {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
};

const logout = async () => {
    console.log('logout');

    return await fetch(url+'auth/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: 'include'
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
    return await fetch(url+'messages?' + new URLSearchParams(params), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: 'include'
    });
};

const addMessage = async (text, isPersonal, to) => {
    return await fetch(url+'messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: 'include',
        body: JSON.stringify({
            text,
            isPersonal,
            to
        })
    });
};

const editMessage = async (id, text, isPersonal, to) => {
    return await fetch(url+'messages/'+id, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: 'include',
        body: JSON.stringify({
            text,
            isPersonal,
            to
        })
    });
};

const deleteMessage = async (id) => {
    return await fetch(url+'messages/'+id, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: 'include'
    });
};

const getUsers = async () => {
    return await fetch(url + 'users', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        credentials: 'include'
    });
};