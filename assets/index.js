// Initialize Firebase
var config = {
};
firebase.initializeApp(config);

var database = firebase.database();
var is_login
var user = getCookie('account')

$(document).ready(function() {
    $('.modal').modal('setting', 'closable', false)
    checkCookie()
    check_account()
})

/************** Cookie **************/

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";"
}

function getCookie(cname) {
    var name = cname + "="
    var decodedCookie = decodeURIComponent(document.cookie)
    var ca = decodedCookie.split(';')
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i]
        while(c.charAt(0) == ' ') {
            c = c.substring(1)
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length)
        }
    }
    return ""
}

function checkCookie() {
    user = getCookie('account')
    if (user != "") {
        $('#contain_column').html("<div class = 'ui stacked segment'><div class = 'ui message'>現在帳號為: "+ escapeHTML(user) +"</div><div class = 'ui fluid blue basic animated button' id = 'logout_btn'><div class = 'visible content'>登出</div><div class = 'hidden content'><i class = 'sign out icon'></i></div></div>")
        $('#logout_btn').click(function() {
            setCookie('account', '')
            checkCookie()
            $('#admin_btn').remove()
            $('#logout_success').modal('show')
        })
    } else {
        $('#contain_column').html("<form id = 'login_form' class = 'ui large form'><div class = 'ui stacked segment'><div class = 'field'><div class = 'ui left icon input'><i class = 'user icon'></i><input type = 'text' id = 'account' placeholder = 'Account'></div></div><div class = 'field'><div class = 'ui left icon input'><i class = 'lock icon'></i><input type = 'password' id = 'pwd' placeholder = 'Password'></div></div><div class = 'ui fluid large buttons'><div class = 'ui red basic animated button' id = 'login_btn'><div class = 'visible content'>登入</div><div class = 'hidden content'><i class = 'sign in icon'></i></div></div><div class = 'ui green animated basic button' id = 'reg_btn'><div class = 'visible content'>註冊</div><div class = 'hidden content'><i class = 'add user icon'></i></div></div></div></div></form>")
        $('#login_btn').click(function() {
            is_login = false
            $('#load_index').show()
            database.ref('/users').once('value').then(
                function(snapshot) {
                    snapshot.forEach(function(snap) {
                        if ($('#account').val() == snap.val()['account'] && $('#pwd').val() == snap.val()['pwd']) {
                            is_login = true
                        }
                    })
                   
                    if (is_login) {
                        $("#login_success").modal('show')
                        setCookie("account", $('#account').val())
                        checkCookie()
                        check_account()
                    } else {
                        $("#login_failed").modal('show')
                    }
                    $('#load_index').hide()
                }
            )
        })
        $('#reg_btn').click(function() {
            $('#reg_acc').val('')
            $('#reg_pwd').val('')
            $('#account').val('')
            $('#pwd').val('')
            $('#reg_err').remove()
            $('#reg_modal').modal('setting', {
                onApprove: function() {
                    return false;
                }
            }).modal('show')
        })
    }
}

function check_account() {
    
    $('#load_index').show()

    database.ref('/users').once('value').then(function(users) {
        user_count = 1
        users.forEach(function(u) {
            if (user == u.val()['account']) {
                c = user_count
                database.ref('/users/'+ c +'/admin').once('value').then (
                    function(snapshot) {
                        if (snapshot.val()) {
                            $('#toindex').before("<a href = './admin.html' class = 'large item' id = 'admin_btn'> 管理 </a>")
                        }
                    }
                )
            }
            user_count++
        })
        $('#load_index').hide()
    })
}

/************** Change Page **************/

$('#go_to_input').click(function() {
    
    user = getCookie('account')
    if (user != "") {
        window.location = './report.html'
    } else {
        $('#not_login').modal('show')    
    }
})

$('#go_to_edit').click(function() {

    user = getCookie('account')
    if (user != "") {
        window.location = './edit.html'
    } else {
        $('#not_login').modal('show')    
    }

})

$('#go_to_show').click(function() {

    user = getCookie('account')
    if (user != "") {
        window.location = './show.html'
    } else {
        $('#not_login').modal('show')    
    }

})

/************** Register **************/
$('#reg_ok').click(function(e) {
    e.preventDefault()
    var repeat_acc = false
    if ($('#reg_acc').val() == "" || $('#reg_pwd').val() == "") {
        $('#reg_err').remove()
        $('<p id = "reg_err" style = "color:red;">帳號或密碼不得為空</p>').insertBefore('#reg_form')
    } else {
        $('#load_index').show()
        database.ref('/users').once('value').then(function(users_exist) {
            var i = 1
            while(users_exist.val()[i]) {
                if ($('#reg_acc').val() == users_exist.val()[i]['account']) {
                    $('#reg_err').remove()
                    $('<p id = "reg_err" style = "color:red;"> 帳號名稱已被使用 </p>').insertBefore('#reg_form')
                    repeat_acc = true
                    break
                }
                i++
            }
            if (!repeat_acc) {
                $('#reg_err').remove()
                database.ref('/users').once('value').then(function(users) {
                    var count = users.numChildren()+1
                    var updates = {}
                    var data = {
                        'account':$('#reg_acc').val(),
                        'pwd':$('#reg_pwd').val(),
                        'admin':0
                    }
                    updates['/users/' + count] = data
                    database.ref().update(updates).then(function() {
                        $('#reg_success').modal('show')
                    }).catch(function(err) {
                        console.log('Reg failed' + err)
                        $('#reg_failed').modal('show')
                    })
                })
            }
            $('#load_index').hide()
        })
    }
})

/************** Prevent attack **************/

function escapeHTML(data) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039'
    };

    return data.replace(/[&<>"']/g, function(m) {return map[m];})
}

