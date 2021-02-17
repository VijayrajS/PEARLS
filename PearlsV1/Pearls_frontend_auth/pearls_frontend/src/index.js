import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import PEARLS from './PEARLS';
import Login from './Login'
import { ProtectedRoute } from './ProtectedRoute'

import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import * as serviceWorker from './serviceWorker';

function FinalApp() {
    return (
        <div>
            <Switch>
                <Route exact path="/">
                    <Redirect to="/login" />
                </Route>
                <Route exact path='/login' component={Login} />
                <ProtectedRoute exact path='/PEARLS' component={PEARLS} />
            </Switch>
        </div>
    )
}

ReactDOM.render(<BrowserRouter><FinalApp style={{height:"100%"}}/></BrowserRouter>,  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

serviceWorker.unregister();
