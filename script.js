var $messages = $('.messages-content'),
    d, h, m;

// 开场白
var introMessage = "你好👋👋，唠什么 !!!"
var maxLength = 60;

// 存储消息的数组
var Messages = [
    { "role": "system", "content": systemMessage },
];

$(window).load(function () {
    $messages.mCustomScrollbar();
    setTimeout(function () {
        fakeMessage(introMessage);
    }, 100);
});

function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
    });
}

function setDate() {
    d = new Date()
    if (m != d.getMinutes()) {
        m = d.getMinutes();
        $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
    }
}

function addMessage(role, message) {
    // Messages的长度小于等于 20 时，直接添加
    // 否则，删除Messages的第二个元素，再添加
    if (Messages.length <= maxLength) {
        Messages.push(
            { "role": role, "content": message }
        );
    } else {
        Messages.splice(1, 1);
        Messages.push(
            { "role": role, "content": message }
        );
    }
}


function insertMessage() {
    var msg = $('.message-input').val();
    if ($.trim(msg) == '') {
        return false;
    }
    $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    $('.message-input').val(null);
    updateScrollbar();
    addMessage("user", msg);

    fakeMessage();
}

$('.message-submit').click(function () {
    insertMessage();
});

$(window).on('keydown', function (e) {
    if (e.which == 13) {
        insertMessage();
        return false;
    }
})

async function sendChatMessage(Messages) {
    var apiEndpoint = 'https://flag.smarttrot.com/v1/chat/completions';
    var apiSecretKey = 'c3cf69441024458518616ddd3c36add4';

    var requestData = {
        messages: Messages,
    };

    try {
        var response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + apiSecretKey
            },
            body: JSON.stringify(requestData)
        });

        var data = await response.json();
        var assistantResponse = data.choices[0].message.content;
        addMessage("assistant", assistantResponse);

        return assistantResponse;
    } catch (error) {
        throw error;
    }
}

function fakeMessage(message) {
    $('<div class="message loading new"><figure class="avatar"><img src="./lyc.png" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();

    var answer;
    if (message) {
        answer = Promise.resolve(message); // 使用开场白作为回答
    } else {
        answer = sendChatMessage(Messages); // 使用 GPT 进行回答
    }

    answer
        .then(response => {
            $('.message.loading').remove();
            $('<div class="message new"><figure class="avatar"><img src="./lyc.png" /></figure>' + response + '</div>').appendTo($('.mCSB_container')).addClass('new');
            setDate();
            updateScrollbar();
        })
        .catch(error => {
            console.error(error);
        });
}