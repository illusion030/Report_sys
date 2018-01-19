// Initialize Firebase
var config = {
};
firebase.initializeApp(config);

var database = firebase.database();
var user = getCookie('account')
var user_count
var year = ""
var number = ""

/**********  Report  **********/

$(document).ready(function() {
    if (!user) {
        alert('尚未登入')
        window.location = './'
    } else {
        check_account()
        update_year()
        update_number()
        update_use()
        update_buy()
        $('#report_date').datepicker({ dateFormat: 'yy/mm/dd' })
        $('#report_date').datepicker('setDate', new Date())
        $('#buy_money').val('NT$0')
        $('.modal').modal('setting', 'closable', false)
    }
})

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

$('#buy_money').focusout(function() {
    if ($.isNumeric($('#buy_money').val())) {
        var num = $('#buy_money').val()
        $('#buy_money').val('NT$' + num)
    }
})

function check_account() {
    $('#load_report').show()
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
        $('#load_report').hide()
    })
}

function update_year() {
    $('#load_report').show()
    $('#year_menu').empty()
    database.ref('/年度').once('value').then (
        function(snapshot) {
            var i = 1
            while (snapshot.val()[i]) {
                $("#year_title").find('.menu').append("<div class = 'item' data-value = '" + snapshot.val()[i] + "'>" + snapshot.val()[i]  + "</div>");
                i++
            }
            $('#year_title').dropdown({
                onChange: function() {
                    year = $('#year_title').dropdown('get value')
                    $('#number_title').dropdown('clear')
                    $('#use_title').dropdown('clear')
                    number = ""
                    update_number()
                }
            })
            $('#load_report').hide()
        }
    )
}

function update_number() {
    
    $('#number_menu').empty()
    
    if (year != "") {
        $('#load_report').show()
        database.ref('/會編/' + year).once('value').then (
            function(snapshot) {
                var i = 1
                if (snapshot.val()) {
                    while (snapshot.val()[i]) {
                        $("#number_title").find('.menu').append("<div class = 'item' data-value = '" + snapshot.val()[i] + "'>" + snapshot.val()[i]  + "</div>");
                        i++
                    }
                }
                $('#number_title').dropdown({
                    onChange: function() {
                        number = $('#number_title').dropdown('get value'),
                        $('#use_title').dropdown('clear')
                        update_use()
                    }
                })
                $('#load_report').hide()
            }
        )
    } else
        $('#load_report').hide()
}

function update_use() {
    $('#use_menu').empty()
    if (year != "" && number != "") {
        $('#load_report').show()
        database.ref('/實施主軸/' + year + '/' + number).once('value').then (
            function(snapshot) {
                var i = 1
                if (snapshot.val()) {
                    while (snapshot.val()[i]) {
                        $("#use_title").find('.menu').append("<div class = 'item' data-value = '" + snapshot.val()[i] + "'>" + snapshot.val()[i]  + "</div>");
                        i++
                    }
                }
                $('#use_title').dropdown()
                $('#load_report').hide()
            }
        )
    } else
        $('#load_report').hide()
}

function update_buy() {
    $('#load_report').show()
    $('#buy_menu').empty()
    database.ref('/請購類別').once('value').then (
        function(snapshot) {
            var i = 1
            while (snapshot.val()[i]) {
                $("#buy_type").find('.menu').append("<div class = 'item' data-value = '" + snapshot.val()[i] + "'>" + snapshot.val()[i]  + "</div>");
                i++
            }
            $('#buy_type').dropdown()
            $('#load_report').hide()
        }
    )
}

$('#report_save').click(function(e) {
    e.preventDefault()
    $('#check_report').modal('show')
})

$('#report_ok').click(function(e){
    e.preventDefault()
    $('#load_report').show()
    database.ref('/users').once('value').then(function(users) {
        user_count = 1
        users.forEach(function(u) {
            if (user == u.val()['account']) {
                c = user_count
                database.ref('/users/'+ c + '/' + year + '/' + number + '/報表').once('value').then (
                    function(snapshot) {
                        var count = snapshot.numChildren()+1
                        var updates = {}
                        var data = {
                            '建檔日期':$('#report_date').val(),
                            '請購編號':$('#buy_num').val(),
                            '實施主軸':$('#use_title').dropdown('get value'),
                            '請購類別':$('#buy_type').dropdown('get value'),
                            '請購項目':$('#buy_name').val(),
                            '請購金額':$('#buy_money').val(),
                            '傳票號碼':$('#ticket_num').val()
                        }
                        updates['/users/'+ c + '/' + year + '/' + number + '/報表/'+ count] = data
                        database.ref().update(updates).then(function() {
                            $('#report_date').datepicker('setDate', new Date())
                            $('#buy_num').val('')
                            $('.ui.dropdown').dropdown('clear')
                            $('#buy_name').val('')
                            $('#buy_money').val('NT$0')
                            $('#ticket_num').val('')
                            $('#success').modal('show')
                            year = ""
                            number = ""
                        }).catch(function(err) {
                            console.log('Save failed.' + err)
                            $('#failed').modal('show')
                        })
                    }
                )
            }
            user_count++
        })
        $('#load_report').hide()
    })

})

/*****************************************************/
/***************  Edit year  *************************/

$('#edit_year').click(function(e) {
    
    e.preventDefault()

    $('#year_table > tbody').empty()

    database.ref('/年度').once('value').then (
        function(snapshot) {
            var i = 1
            while (snapshot.val()[i]) {
                $("#year_table > tbody:last-child").append('<tr id = "'+ snapshot.val()[i] +'"><td contenteditable = "true">'+ snapshot.val()[i] +'</td><td><div class = "ui buttons"><div class = "ui green basic animated vertical button" onclick = "button_up(this)"><div class = "visible content">上移</div><div class = "hidden content"><i class = "angle double up large icon"></i></div></div><div class = "ui green basic animated vertical button" onclick = "button_down(this)"><div class = "visible content">下移</div><div class = "hidden content"><i class = "angle double down large icon"></i></div></div><div class = "ui red basic animated vertical button" onclick = "remove_item(\''+ snapshot.val()[i] +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></div></td></tr>')
                i++
            }
            $('#year_modal').modal('show')
        }
    )
    
})

$('#add_year').click(function(e) {
    e.preventDefault()
    var item = $('#add_year_input').val()
    
    if (item) { 
        $("#year_table > tbody:last-child").append('<tr id = "'+ item +'"><td contenteditable = "true">'+ item +'</td><td><div class = "ui buttons"><div class = "ui green basic animated vertical button" onclick = "button_up(this)"><div class = "visible content">上移</div><div class = "hidden content"><i class = "angle double up large icon"></i></div></div><div class = "ui green basic animated vertical button" onclick = "button_down(this)"><div class = "visible content">下移</div><div class = "hidden content"><i class = "angle double down large icon"></i></div></div><div class = "ui red basic animated vertical button" onclick = "remove_item(\''+ item +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></div></td></tr>')
        $('#add_year_input').val('')
    }
})

$('#year_save').click(function(e) {
    e.preventDefault()
    $('#check_year').modal('show')
})

$('#year_ok').click(function(e){
      e.preventDefault()
      
      var i = 1
      var updates = {}
      var data = {}

      $('#year_table > tbody > tr > td:first-child').each(function(i, item) {
          data[i+1] = item.innerHTML
      })
      updates['/年度'] = data
      database.ref().update(updates).then(function() {
          update_year()
          $('#success').modal('show')
      }).catch(function(err) {
          console.log('Save failed.' + err)
          $('#failed').modal('show')
      })
})

$('#year_cancel').click(function(e){
      e.preventDefault()
      $('#year_modal').modal('show')
})

$('#year_close').click(function(e){
      e.preventDefault()
      $('#year_modal').modal('hide')
})

/*****************************************************/
/***************  Edit number  **************************/

$('#edit_number').click(function(e) {
    
    e.preventDefault()

    $('#number_table > tbody').empty()
    if (year != "") {
        database.ref('/會編/' + year).once('value').then (
            function(snapshot) {
                var i = 1
                if (snapshot.val()) {
                    while (snapshot.val()[i]) {
                        $("#number_table > tbody:last-child").append('<tr id = "'+ snapshot.val()[i] +'"><td contenteditable = "true">'+ snapshot.val()[i] +'</td><td><div class = "ui buttons"><div class = "ui green basic animated vertical button" onclick = "button_up(this)"><div class = "visible content">上移</div><div class = "hidden content"><i class = "angle double up large icon"></i></div></div><div class = "ui green basic animated vertical button" onclick = "button_down(this)"><div class = "visible content">下移</div><div class = "hidden content"><i class = "angle double down large icon"></i></div></div><div class = "ui red basic animated vertical button" onclick = "remove_item(\''+ snapshot.val()[i] +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></div></td></tr>')
                        i++
                    }
                }
                $('#number_modal').modal('show')
            }
        )
    }
    
})

$('#add_number').click(function(e) {
    e.preventDefault()
    var item = $('#add_number_input').val()
    
    if (item) { 
        $("#number_table > tbody:last-child").append('<tr id = "'+ item +'"><td contenteditable = "true">'+ item +'</td><td><div class = "ui buttons"><div class = "ui green basic animated vertical button" onclick = "button_up(this)"><div class = "visible content">上移</div><div class = "hidden content"><i class = "angle double up large icon"></i></div></div><div class = "ui green basic animated vertical button" onclick = "button_down(this)"><div class = "visible content">下移</div><div class = "hidden content"><i class = "angle double down large icon"></i></div></div><div class = "ui red basic animated vertical button" onclick = "remove_item(\''+ item +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></div></td></tr>')
        $('#add_number_input').val('')
    }
})

$('#number_save').click(function(e) {
    e.preventDefault()
    $('#check_number').modal('show')
})

$('#number_ok').click(function(e){
      e.preventDefault()
      
      var i = 1
      var updates = {}
      var data = {}

      $('#number_table > tbody > tr > td:first-child').each(function(i, item) {
          data[i+1] = item.innerHTML
      })
      updates['/會編/' + year] = data
      database.ref().update(updates).then(function() {
          update_number()
          $('#success').modal('show')
      }).catch(function(err) {
          console.log('Save failed.' + err)
          $('#failed').modal('show')
      })
})

$('#number_cancel').click(function(e){
      e.preventDefault()
      $('#number_modal').modal('show')
})

$('#number_close').click(function(e){
      e.preventDefault()
      $('#number_modal').modal('hide')
})

/*****************************************************/
/***************  Edit use  **************************/

$('#edit_use').click(function(e) {
    
    e.preventDefault()

    $('#use_table > tbody').empty()
    
    if (year != "" && number != "") {
        database.ref('/實施主軸/' + year + '/' + number).once('value').then (
            function(snapshot) {
                var i = 1
                if (snapshot.val()) {
                    while (snapshot.val()[i]) {
                        $("#use_table > tbody:last-child").append('<tr id = "'+ snapshot.val()[i] +'"><td contenteditable = "true">'+ snapshot.val()[i] +'</td><td><div class = "ui buttons"><div class = "ui green basic animated vertical button" onclick = "button_up(this)"><div class = "visible content">上移</div><div class = "hidden content"><i class = "angle double up large icon"></i></div></div><div class = "ui green basic animated vertical button" onclick = "button_down(this)"><div class = "visible content">下移</div><div class = "hidden content"><i class = "angle double down large icon"></i></div></div><div class = "ui red basic animated vertical button" onclick = "remove_item(\''+ snapshot.val()[i] +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></div></td></tr>')
                        i++
                    }
                }
                $('#use_modal').modal('show')
            }
        )
    }
})

$('#add_use').click(function(e) {
    e.preventDefault()
    var item = $('#add_use_input').val()
    
    if (item) { 
        $("#use_table > tbody:last-child").append('<tr id = "'+ item +'"><td contenteditable = "true">'+ item +'</td><td><div class = "ui buttons"><div class = "ui green basic animated vertical button" onclick = "button_up(this)"><div class = "visible content">上移</div><div class = "hidden content"><i class = "angle double up large icon"></i></div></div><div class = "ui green basic animated vertical button" onclick = "button_down(this)"><div class = "visible content">下移</div><div class = "hidden content"><i class = "angle double down large icon"></i></div></div><div class = "ui red basic animated vertical button" onclick = "remove_item(\''+ item +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></div></td></tr>')
        $('#add_use_input').val('')
    }
})

$('#use_save').click(function(e) {
    e.preventDefault()
    $('#check_use').modal('show')
})

$('#use_ok').click(function(e){
      e.preventDefault()
      
      var i = 1
      var updates = {}
      var data = {}

      $('#use_table > tbody > tr > td:first-child').each(function(i, item) {
          data[i+1] = item.innerHTML
      })
      
      updates['/實施主軸/' + year + '/' + number] = data
      database.ref().update(updates).then(function() {
          update_use()
          $('#success').modal('show')
      }).catch(function(err) {
          console.log('Save failed.' + err)
          $('#failed').modal('show')
      })
})

$('#use_cancel').click(function(e){
      e.preventDefault()
      $('#use_modal').modal('show')
})

$('#use_close').click(function(e){
      e.preventDefault()
      $('#use_modal').modal('hide')
})

/***************************************************/
/***************  Edit buy  ************************/

$('#edit_buy').click(function(e) {
    
    e.preventDefault()

    $('#buy_table > tbody').empty()
   
    database.ref('/請購類別').once('value').then (
        function(snapshot) {
            var i = 1
            while (snapshot.val()[i]) {
                $("#buy_table > tbody:last-child").append('<tr id = "'+ snapshot.val()[i] +'"><td contenteditable = "true">'+ snapshot.val()[i] +'</td><td><div class = "ui buttons"><div class = "ui green basic animated vertical button" onclick = "button_up(this)"><div class = "visible content">上移</div><div class = "hidden content"><i class = "angle double up large icon"></i></div></div><div class = "ui green basic animated vertical button" onclick = "button_down(this)"><div class = "visible content">下移</div><div class = "hidden content"><i class = "angle double down large icon"></i></div></div><div class = "ui red basic animated vertical button" onclick = "remove_item(\''+ snapshot.val()[i] +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></div></td></tr>')
                i++
            }
            $('#buy_modal').modal('show')
        }
    )
})

$('#add_buy').click(function(e) {
    e.preventDefault()
    var item = $('#add_buy_input').val()
    
    if (item) { 
        $("#buy_table > tbody:last-child").append('<tr id = "'+ item +'"><td contenteditable = "true">'+ item +'</td><td><div class = "ui buttons"><div class = "ui green basic animated vertical button" onclick = "button_up(this)"><div class = "visible content">上移</div><div class = "hidden content"><i class = "angle double up large icon"></i></div></div><div class = "ui green basic animated vertical button" onclick = "button_down(this)"><div class = "visible content">下移</div><div class = "hidden content"><i class = "angle double down large icon"></i></div></div><div class = "ui red basic animated vertical button" onclick = "remove_item(\''+ item +'\')"><div class = "visible content">刪除</div><div class = "hidden content"><i class = "remove circle outline large red icon"></i></div></div></div></td></tr>')
        $('#add_buy_input').val('')
    }
})

$('#buy_save').click(function(e) {
    e.preventDefault()
    $('#check_buy').modal('show')
})

$('#buy_ok').click(function(e){
      e.preventDefault()
      
      var i = 1
      var updates = {}
      var data = {}

      $('#buy_table > tbody > tr > td:first-child').each(function(i, item) {
          data[i+1] = item.innerHTML
      })
      updates['/請購類別'] = data
      database.ref().update(updates).then(function() {
          update_buy()
          $('#success').modal('show')
      }).catch(function(err) {
          console.log('Save failed.' + err)
          $('#failed').modal('show')
      })
})

$('#buy_cancel').click(function(e){
      e.preventDefault()
      $('#buy_modal').modal('show')
})

$('#buy_close').click(function(e){
      e.preventDefault()
      $('#buy_modal').modal('hide')
})

/****************************************************/
/***************  Event function  *******************/

function remove_item(e) {
    $('#'+ e +'').remove()
}

function button_down(e) {
    row = $(e).parents('tr:first')
    row.insertAfter(row.next())
}

function button_up(e) {
    row = $(e).parents('tr:first')
    row.insertBefore(row.prev())
}

$('#cancel').click(function(e){
    e.preventDefault()
})
/***************************************************/
