// Initialize Firebase
var config = {
};
firebase.initializeApp(config);

var database = firebase.database();
var is_changed = false
var user = getCookie('account')
var user_count
var cb_count = {items: []}
var year = ""
var number = ""

$(document).ready(function() {
    if (!user) {
        alert('請先登入')
        window.location = './index.html'
    } else {
        year = ""
        number = ""
        $('#start_date').datepicker({ dateFormat: 'yy/mm/dd' })
        $('#end_date').datepicker({ dateFormat: 'yy/mm/dd' })
        check_account()
        update_year()
        update_number()
        update_usecb()
        update_buycb()
        update_report()
    }
})

/****************** get user account ****************/
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

function check_account() {
    $('#load_edit').show()
    database.ref('/users').once('value').then(function(users) {
         user_count = 1
         users.forEach(function(u) {
            if (user == u.val()['account']) {
                c = user_count
                database.ref('/users/'+ c +'/admin').once('value').then (
                    function(snapshot) {
                        if (snapshot.val()) {
                            $('#toindex').before("<a href = './admin.html' class = 'large item'> 管理 </a>")
                        }
                    }
                )
            }
            user_count++
        })
        $('#load_edit').hide()
    })
}

/**************** selection ***********************/

$('#start_date').change(function() {
    show_count('start', 'date')
})

$('#end_date').change(function() {
    show_count('end', 'date')
})

$('#clr_btn').click(function() {

    $('#start_date').val('')
    $('#end_date').val('')

    show_count('clr', 'date')
})

$('#not_filled_cb').checkbox({
    onChecked: function() {
        show_count("filled", "cb")
    },
    onUnchecked: function() {
        show_count("filled", "cb")
    }
})

function show_count(e, str) {

    for (i in cb_count.items) {
        if (e == cb_count.items[i].use_id)
            if (str == 'show')
                cb_count.items[i].count++
            else if (str == 'hide')
                cb_count.items[i].count--
        
        if (e == cb_count.items[i].buy_id)            
            if (str == 'show')
                cb_count.items[i].count++
            else if (str == 'hide')
                cb_count.items[i].count--
        
        var get_item =  $("#"+ cb_count.items[i].use_id + cb_count.items[i].buy_id + cb_count.items[i].buy_num +"")
        
        if (cb_count.items[i].count == 2) {
            get_item.show()
            if ($('#start_date').val() != "" && $('#end_date').val() != "") {
                if(get_item.length > 0) {
                    for (j = 0; j < get_item.length; j++) {
                        var start_date = new Date($('#start_date').val())
                        var end_date = new Date($('#end_date').val())
                        var item_date = new Date(get_item[j].cells[0].innerHTML)

                        if (item_date < start_date || item_date > end_date)
                            $(get_item[j]).hide()
                    }
                }
            }

            var is_filled
            if ($('#not_filled_cb').checkbox('is checked')) {
                if(get_item.length > 0) {
                    for (j = 0; j < get_item.length; j++) {
                        is_filled = true
                        for (k = 0; k < get_item[j].cells.length; k++) {
                            if (get_item[j].cells[k].innerHTML == "")
                                is_filled = false
                        }
                        if (is_filled)
                            $(get_item[j]).hide()
                    }
                }
            }
        }

        if (cb_count.items[i].count < 2)
            get_item.hide()
    }
}

/*********** update function *****************/

function update_year() {
    $('#load_edit').show()
    $('#year_menu').empty()
    database.ref('/年度').once('value').then (function(snapshot) {
        var i = 1
        while (snapshot.val()[i]) {
            $('#year_drop').find('.menu').append("<div class = 'item' data-value = '" + snapshot.val()[i] + "'>" + snapshot.val()[i] + "</div>")
            i++
        }
        $('#year_drop').dropdown({
            onChange: function() {
                year = $('#year_drop').dropdown('get value')
                $('#number_drop').dropdown('clear')
                number = ""
                update_number()
            }
        })
        $('#load_edit').hide()
    })
}

function update_number() {
    
    $('#number_menu').empty()

    if (year != "") {
        $('#load_edit').show()
        database.ref('/會編/' + year).once('value').then (function(snapshot) {
            var i = 1
            if (snapshot.val()[i]) {
                while (snapshot.val()[i]) {
                    $('#number_drop').find('.menu').append("<div class = 'item' data-value = '" + snapshot.val()[i] + "'>" + snapshot.val()[i] + "</div>")
                    i++
                }
                $('#number_drop').dropdown({
                    onChange: function() {
                        number = $('#number_drop').dropdown('get value')
                        update_usecb()
                        update_report()
                    }
                })
            }
            $('#load_edit').hide()
        })
    }
}

function update_report() {
    $('#report_table > tbody').empty()
    
    if (year != "" && number != "") {
        $('#load_edit').show()
        database.ref('/users').once('value').then(function(users) {
            user_count = 1
            users.forEach(function(u) {
                if (user == u.val()['account']) {
                    var c = user_count
                    database.ref('users/' + c + '/' + year + '/' + number + '/報表').once('value').then (
                        function(snapshot) {
                            snapshot.forEach(function(snap) {
                                $('#report_table > tbody:last-child').append('<tr id = "'+ snap.val()['實施主軸'] + snap.val()['請購類別'] + snap.val()['請購編號'] +'"><td contenteditable="true" oninput = "edit_change()" class = "date">'+ snap.val()['建檔日期'] +'</td><td contenteditable="true" oninput = "edit_change()">'+ snap.val()['請購編號'] +'</td><td contenteditable="true" oninput = "edit_change()">'+ snap.val()['實施主軸'] +'</td><td contenteditable="true" oninput = "edit_change()">'+ snap.val()['請購類別'] +'</td><td contenteditable="true" oninput = "edit_change()">'+ snap.val()['請購項目'] +'</td><td contenteditable="true" oninput = "edit_change()">'+ snap.val()['請購金額'] +'</td><td contenteditable="true" oninput = "edit_change()">'+ snap.val()['傳票號碼'] +'</td><td class = "single line"><div class = "ui red basic animated button" onclick = "remove_edit(\''+ snap.val()['實施主軸'] + snap.val()['請購類別'] + snap.val()['請購編號'] +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></td></tr>')
                                cb_count.items.push({use_id: snap.val()['實施主軸'], buy_id: snap.val()['請購類別'], buy_num: snap.val()['請購編號'], count: 2})
                            })
                        }
                    )
                }
                user_count++
            })
            $('#start_date').val('')
            $('#end_date').val('')
            $('.checkbox').checkbox('check')
            $('#not_filled_cb').checkbox('uncheck')
            is_changed = false
            $('#load_edit').hide()
        })
    }
}

function update_usecb() {

    $('#use_seg').empty()
    $('#use_seg').append ("<div class = 'ui top left attached large label'>實施主軸</div>")
    $('#load_edit').show()

    if (year != "" && number != "") {
        $('#load_edit').show()
        database.ref('/實施主軸/' + year + '/' + number + '').once('value').then(function(snapshot) {
            snapshot.forEach(function(snap) {
                $('#use_seg').append ("<div class = 'ui checkbox' id = 'cb"+ snap.val() +"'><input type = 'checkbox' checked = ''><label>" + snap.val() + "</label></div><br>")
                $('#cb'+ snap.val()).checkbox({
                    onChecked: function() {
                        show_count($(this.nextSibling.firstChild)[0].textContent, 'show')
                    },
                    onUnchecked: function() {
                        show_count($(this.nextSibling.firstChild)[0].textContent, 'hide')
                    }
                })
            })
            $('#load_edit').hide()
        })
    }
}

function update_buycb() {
    
    database.ref('/請購類別').once('value').then(function(snapshot) {
        $('#show_select').append ("<div class = 'ui segment' id = 'buy_seg'><div class = 'ui top left attached large label'>請購類別</div></div>")
        snapshot.forEach(function(snap) {
            $('#buy_seg').append ("<div class = 'ui checkbox' id = 'cb"+ snap.val() +"'><input type = 'checkbox' checked = ''><label>" + snap.val() + "</label></div><br>")
            $('#cb'+ snap.val()).checkbox({
                onChecked: function() {
                    show_count($(this.nextSibling.firstChild)[0].textContent, 'show')
                },
                onUnchecked: function() {
                    show_count($(this.nextSibling.firstChild)[0].textContent, 'hide')
                }
            })
        })
    })
}

/******** edit ********************/

$('#edit_save').click(function(e) {
    
    e.preventDefault()
    
    if (is_changed) 
        $('#check_edit').modal('show')
    else
        $('#no_change').modal('show')
})

$('#edit_refresh').click(function(e) {

    e.preventDefault()
    update_report()
})

$('.ui.ok.button').click(function(e) {

    var i = 1
    var updates = {}
    var data = {}

    $('#report_table > tbody > tr').each(function(i, item) {
        data[i+1] = {
            '建檔日期':item.cells[0].innerHTML,
            '請購編號':item.cells[1].innerHTML,
            '實施主軸':item.cells[2].innerHTML,
            '請購類別':item.cells[3].innerHTML,
            '請購項目':item.cells[4].innerHTML,
            '請購金額':item.cells[5].innerHTML,
            '傳票號碼':item.cells[6].innerHTML
        }
    })

    $('#load_edit').show()
    database.ref('/users').once('value').then(function(users) {
        user_count = 1
        users.forEach(function(u) {
            if (user == u.val()['account']) {
                var c = user_count
                updates['users/'+ c + '/' + year + '/' + number + '/報表'] = data
                database.ref().update(updates).then(function() {
                    is_changed = false
                    $('#load_edit').hide()
                    $('#success').modal('show')
                    update_report()
                }).catch(function(err) {
                    console.log('Edit failed.' + err)
                    is_changed = false
                    $('#load_edit').hide()
                    $('#failed').modal('show')
                })
            }
            user_count++
        })
    })
})

function edit_change(){
    is_changed = true
}

function remove_edit(e) {
    $('#' + e + '').remove()
    is_changed = true
}
