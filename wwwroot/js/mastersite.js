/*var connection = new signalR.HubConnectionBuilder().withUrl("/falconhub").build();

        connection.on("refreshToken", (value) => {
            var urlLogin = "/Account/Login";
            if(value.toString() == "1"){
                console.log("refresh token");
                refreshToken();
            }
            else if (value.toString() == "0") {
                localStorage.clear();
                //window.location.href = urlLogin;
            }
        });*/
var storedJsonString = localStorage.getItem("dataLogin");

var storedData = JSON.parse(storedJsonString);

var txtGui = storedData.obj.prmObj.objData.UserLogin.TxtGui;
var TxtUserId = storedData.obj.prmObj.objData.UserLogin.TxtUserId;
var IntCabangId = storedData.obj.prmObj.objData.UserLogin.IntCabangId;
var TxtJabatanId = storedData.obj.prmObj.objData.UserLogin.TxtJabatanId;
var AccessToken = storedData.obj.access_token;
var ajaxtimeout = 40000;
let timeouttoken = 50000;

const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const monthFullNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

var toolbarOptions = [
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['link', 'image'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['html']
];

var cktoolbar = {
    items: [
        //'exportPDF', 'exportWord', '|',
        'findAndReplace', 'selectAll', '|',
        'fontSize', 'heading', '|',
        'bold', 'italic', 'underline', 'subscript', 'superscript', 'removeFormat', '|',
        'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent', '|',
        'undo', 'redo', '|',
        'fontfamily', 'fontsize', 'fontColor', 'fontBackgroundColor', '|',
        'alignment', '|',
        'insertImage', 'insertTable', '|',
        'horizontalLine', 'pageBreak', '|',
        'sourceEditing'
    ],
    shouldNotGroupWhenFull: true
};

var ckheading = {
    options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
        { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
        { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
    ]
};

var ckfontsize = {
    options: [10, 12, 14, 'default', 18, 20, 22],
    supportAllValues: true
};

var ckhtmlsupport = {
    allow: [
        {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true
        }
    ]
};

var ckmention = {
    feeds: [
        {
            marker: '@',
            feed: [
                '@apple', '@bears', '@brownie', '@cake', '@cake', '@candy', '@canes', '@chocolate', '@cookie', '@cotton', '@cream',
                '@cupcake', '@danish', '@donut', '@dragée', '@fruitcake', '@gingerbread', '@gummi', '@ice', '@jelly-o',
                '@liquorice', '@macaroon', '@marzipan', '@oat', '@pie', '@plum', '@pudding', '@sesame', '@snaps', '@soufflé',
                '@sugar', '@sweet', '@topping', '@wafer'
            ],
            minimumCharacters: 1
        }
    ]
};

var ckremoveplugin = [
    'CKBox',
    'CKFinder',
    'EasyImage',
    'RealTimeCollaborativeComments',
    'RealTimeCollaborativeTrackChanges',
    'RealTimeCollaborativeRevisionHistory',
    'PresenceList',
    'Comments',
    'TrackChanges',
    'TrackChangesData',
    'RevisionHistory',
    'Pagination',
    'WProofreader',
    'MathType',
    'SlashCommand',
    'Template',
    'DocumentOutline',
    'FormatPainter',
    'TableOfContents'
];


function generateAvatar(name) {
    const words = name.split(' ');
    let initials = '';

    for (const word of words) {
        if (initials.length < 2) {
            initials += word.charAt(0).toUpperCase();
        }
    }

    const avatarElement = document.getElementById('avatar');
    avatarElement.textContent = initials;

    const nameAvatar = document.getElementById('nameavatar');
    nameAvatar.textContent = name;
}

$(document).ready(function () {
    var fullname = storedData.obj.prmObj.objData.UserLogin.TxtName;

    generateAvatar(fullname);

    var expired;
    if (storedData != null) {
        expired = storedData.obj.expiresAt;
        var dateTime = new Date(expired);

        // Membuat objek Date untuk saat ini
        const now = new Date();

        // Menghitung selisih waktu dalam milidetik
        const timeDiffInMilliseconds = dateTime - now;

        // Mengonversi selisih waktu dari milidetik ke menit
        const timeDiffInMinutes = Math.floor(timeDiffInMilliseconds / (1000 * 60));

        console.log(`Sisa waktu token: ${timeDiffInMinutes} menit`);

        timeouttoken = (timeDiffInMinutes - 3) * 60 * 1000;

        if (timeDiffInMinutes < 16 && timeDiffInMinutes > 1) {
            refreshToken();
        }
        else if (timeDiffInMinutes < 1) {
            Logout();
        }
        if ($("#hdnMenuId").val() == "Timeout") {
            Logout();
        }

        if (timeouttoken > 0) {
            setTimeout(showAlertToken, timeouttoken);
        }
    }
})

function showAlertToken() {
    Swal.fire({
        icon: 'warning',
        title: 'Akses token akan segera habis',
        showConfirmButton: true,
        text: 'Anda ingin melanjutkan?',
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 180000
    }).then((result) => {
        if (result.isConfirmed) {
            refreshToken();
        }
    });
}

function refreshToken() {
    

    var dataSource;

    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': ''
    };
    $.ajax({
        url: urlApiGlobal + '/apigateway/refreshprmtoken',
        type: "POST",
        data: JSON.stringify(dataObject),
        dataType: "json",
        contentType: "application/json",
        success: function (res) {
            var jsonString = JSON.stringify(res);
            if (res.code == 200) {
                var retvalData = res.obj;
                if (retvalData != null) {
                    storedData.obj.access_token = retvalData.access_token;
                    storedData.obj.expiresAt = retvalData.expiresAt;
                    storedData.id = res.id;
                    const updatedJsonData = JSON.stringify(storedData);
                    localStorage.setItem("dataLogin", updatedJsonData);
                    AccessToken = retvalData.access_token;
                    var dataToSend = {
                        token: retvalData.access_token
                    };

                    if (retvalData != null) {
                        $.ajax({
                            type: "POST",
                            data: dataToSend,
                            url: "/Account/Account/RefreshToken",
                            success: function (data) {
                                console.log("berhasil refresh token");
                            },
                            error: function (xhr, status, error) {
                                alert("Error Refresh Token: " + error);
                            }
                        });

                    }
                }
                else {
                    dataSource = [];
                }
            }
            else {
                var errMessage = res.message;
                if (errMessage != "") {
                    $('#alertLock').removeAttr('hidden');
                    $('#errMessage').text(errMessage);
                }
            }
        },
        error: function (err) {
            console.log('error ' + err);
            if (errMessage != "") {
                $('#alertLock').removeAttr('hidden');
            }
            $('#errMessage').text(err);
            //toastr.error(err.responseJSON.message);
        }
    });
}

function Logout() {
    localStorage.clear();
    var urlLogin = "/Account/Login";
    $.ajax({
        type: "POST",
        url: "/Account/Account/Logout",
        success: function (data) {
            window.location.href = urlLogin;
        },
        error: function (xhr, status, error) {
            alert("Error: " + error);
        }
    });
}

function generateGUID() {
    const hexDigits = '545tc9052kMn6103s';
    let guid = '';

    for (let i = 0; i < 32; i++) {
        guid += hexDigits[Math.floor(Math.random() * 16)];
    }

    // Format the GUID segments
    return (
        guid.substr(0, 8) +
        '-' +
        guid.substr(8, 4) +
        '-' +
        guid.substr(12, 4) +
        '-' +
        guid.substr(16, 4) +
        '-' +
        guid.substr(20)
    );
}

/*function checkToken(){
    var storedJsonString = localStorage.getItem("dataLogin");

    if(storedJsonString == null){
        var urlLogin = "/Account/Login";
        window.location.href = urlLogin;
    }

    var storedData = JSON.parse(storedJsonString);
    var expired;

    if (storedData != null) {
        expired = storedData.obj.expiresAt;
    }
    connection.invoke("NewWindowLoaded", expired);
}
 
 

connection.start().then(function () {
    //checkToken();
}).catch(function (err) {
    console.log("error");
    return console.error(err.toString());
});*/