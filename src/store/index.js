import Vue from 'vue'
import Vuex from 'vuex'
import { getRequest } from "../utils/api"
import SockJS from "sockjs-client"
import Stomp from "stompjs"
import { Notification } from "element-ui"

Vue.use(Vuex)
const now = new Date();

const store = new Vuex.Store({
    state: {  //可以理解为是一个全局对象,用来保存所有组件的公共的数据
        routes: [],
        admins: [],
        sessions: {},
        currentAdmin: JSON.parse(window.sessionStorage.getItem('user')),
        currentSession: null,
        filterKey: '',
        stomp: null,
        isDot: {}
    },
    mutations: {    //改变state值的方法 同步执行
        initRoutes(state, data) {  //初始化state里面的routes
            state.routes = data;
        },
        changeCurrentSession(state, currentSession) {
            state.currentSession = currentSession;
            Vue.set(state.isDot, state.currentAdmin.username + '#' + state.currentSession.username, false);
        },
        addMessage(state, msg) {
            let mss = state.sessions[state.currentAdmin.username + '#' + msg.to];
            if (!mss) {
                //state.sessions[state.currentAdmin.username + '#' + msg.to] = [];
                Vue.set(state.sessions, state.currentAdmin.username + '#' + msg.to, []);
            }
            state.sessions[state.currentAdmin.username + '#' + msg.to].push({
                content: msg.content,
                date: new Date(),
                self: !msg.notSelf
            })
        },
        INIT_DATA(state) {
            //浏览器历史聊天记录
            let data = localStorage.getItem('vue-chat-session');
            //console.log(data)
            if (data) {
                state.sessions = JSON.parse(data);
            }
        },
        INIT_ADMINS(state, data) {
            state.admins = data;
        },
        INIT_ADMIN(state,admin) {
            state.currentAdmin = admin;
        }
    },
    actions: {  //改变state值的方法 异步执行
        initData(context) {
            context.commit('INIT_DATA');
            getRequest('/chat/admin/').then(resp => {
                if (resp) {
                    context.commit('INIT_ADMINS', resp);
                }
            })
        },
        connect(context) {
            context.state.stomp = Stomp.over(new SockJS('/ws/ep'));
            let token = window.sessionStorage.getItem('tokenStr');
            // console.log(token);
            context.state.stomp.connect({ 'Auth-Token': token },
                success => {
                    context.state.stomp.subscribe('/user/queue/chat', msg => {
                        //console.log(msg.body);
                        let receiveMsg = JSON.parse(msg.body);
                        //聊天消息弹框 
                        if (!context.state.currentSession || receiveMsg.from != context.state.currentSession.username) {
                            Notification.info({
                                title: '【' + receiveMsg.fromNickName + '】发来一条消息',
                                message: receiveMsg.content.length > 10 ? receiveMsg.content.substr(0, 10) : receiveMsg.content,
                                position: 'bottom-right'
                            });
                            Vue.set(context.state.isDot, context.state.currentAdmin.username + '#' + receiveMsg.from, true);
                        }
                        receiveMsg.notSelf = true;
                        receiveMsg.to = receiveMsg.from;
                        context.commit('addMessage', receiveMsg);
                    })
                },
                error => {

                })
        }
    }
})
store.watch(function (state) {
    return state.sessions
}, function (val) {
    localStorage.setItem('vue-chat-session', JSON.stringify(val));
}, {
    deep: true/*这个貌似是开启watch监测的判断,官方说明也比较模糊*/
})


export default store;