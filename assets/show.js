// Initialize Firebase
var config = {
};
firebase.initializeApp(config);

var database = firebase.database();
var user = getCookie('account')
var user_count
var cb_count = {items: []}
var year
var number

$(document).ready(function(){
    if (!user) {
        alert('尚未登入')
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

/************** get user account  *************/
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
    $('#load_show').show()
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
        $('#load_show').hide()
    })
}

/**************  selection  ****************/

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

function show_count(e, str) {
    for (i in cb_count.items) {
        if(e == cb_count.items[i].use_id)
            if(str == 'show')
                cb_count.items[i].count++
            else if(str == 'hide')
                cb_count.items[i].count--

        if(e == cb_count.items[i].buy_id)
            if(str == 'show')
                cb_count.items[i].count++
            else if(str == 'hide')
                cb_count.items[i].count--

        //use id to get item
        var get_item =  $("#"+ cb_count.items[i].use_id + cb_count.items[i].buy_id +"")

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
            
            $("#"+ cb_count.items[i].use_id +"").show()
        }

        if (cb_count.items[i].count < 2)
            get_item.hide()
    }
}

/**************  update function  ****************/

function update_year() {
    $('#load_show').show()
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
        $('#load_show').hide()
    })
}

function update_number() {
    $('#number_menu').empty()

    if (year != "") {
        $('#load_show').show()
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
            $('#load_show').hide()
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
                    c = user_count
                    database.ref('users/' + c + '/' + year + '/' + number + '/報表').once('value').then (
                        function(snapshot) {
                            snapshot.forEach(function(snap) {
                                $('#report_table tr:contains("'+ snap.val()['實施主軸'] +'")').after('<tr id = "'+ snap.val()['實施主軸'] + snap.val()['請購類別']+'"><td>'+ snap.val()['建檔日期'] +'</td><td>'+ snap.val()['請購編號'] +'</td><td>'+ snap.val()['請購類別'] +'</td><td>'+ snap.val()['請購項目'] +'</td><td>'+ snap.val()['請購金額'] +'</td><td>'+ snap.val()['傳票號碼'] +'</td></tr>')
                            })
                        }
                    )
                }
                user_count++
            })
            $('#start_date').val('')
            $('#end_date').val('')
            $('.checkbox').checkbox('check')
            $('#load_show').hide()
        })
    }
}

function update_usecb() {

    $('#use_seg').empty()
    $('#use_seg').append ("<div class = 'ui top left attached large label'>實施主軸</div>")

    if (year != "" && number != "") {

        $('#load_show').show()

        database.ref('/實施主軸/' + year + '/' + number + '').once('value').then(function(snapshot) {
            snapshot.forEach(function(snap) {
                $('#use_seg').append ("<div class = 'ui checkbox' id = 'cb"+ snap.val() +"'><input type = 'checkbox' checked = ''><label>" + snap.val() + "</label></div><br>")
                $('#report_table > tbody:last-child').append('<tr id = "'+ snap.val() +'" class = "print_tr"><td colspan = "6" align = "center">'+ snap.val() +'</td></tr>')
                $('#cb'+ snap.val()).checkbox({
                    onChecked: function() {
                        show_count($(this.nextSibling.firstChild)[0].textContent, 'show')
                    },
                    onUnchecked: function() {
                        show_count($(this.nextSibling.firstChild)[0].textContent, 'hide')
                        $("#"+ $(this.nextSibling.firstChild)[0].textContent+ "").hide()
                    }
                })
                database.ref('/請購類別').once('value').then(function(buy) {
                    buy.forEach(function(b) {
                        cb_count.items.push({use_id: snap.val(), buy_id: b.val(), count: 2})
                    })
                })
            })
            $('#load_show').hide()
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
    
        $('#show_select').append ("<div class = 'ui fluid blue basic animated vertical button' onclick = 'print_screen($(\"#print_table\"))'><div class = 'visible content'>列印</div><div class = 'hidden content'><i class = 'print icon'></i></div></div><br>")
    })
}

/**************  print  ****************/

function print_screen(e) {
    $('#report_table').attr('width', '1000px')
    var value = $('#print_table').html()

    var print_page = window.open('', 'PRINT', 'height=400,eidth=600')
    print_page.document.write('<HTML><head><title> Report </title></head><body>')
    print_page.document.write(value)
    print_page.document.write('<style type = "text/css">@media print{ .print_tr td { background-color: #F2FFFF !important; -webkit-print-color-adjust: exact;}}</style></body></html>')
    
    print_page.document.close()
    print_page.focus()
    
    print_page.print()
    print_page.close()
    
    $('#report_table').attr('width', '1200px')
}
