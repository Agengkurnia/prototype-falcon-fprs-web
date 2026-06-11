var id;
var slideon = new Slideon();
var dataeditor;
let ckeditor;
slideon.load()

function Slideon() {
    this.load = function () {
        var elements = document.querySelectorAll('.slideon.slideon-auto');
        elements.forEach(function (element) {
            element.classList.remove("slideon-auto")
            var wrapper = document.createElement('label')
            wrapper.className = element.classList

            var slider = document.createElement('span')
            slider.className = 'slideon-slider'

            element.after(wrapper)
            wrapper.appendChild(element)
            element.after(slider)
        });
    }
}

CKEDITOR.ClassicEditor.create(document.getElementById("editor"), {
    toolbar: cktoolbar,
    heading: ckheading,
    placeholder: '',
    fontSize: ckfontsize,
    htmlSupport: ckhtmlsupport,
    mention: ckmention,
    removePlugins: ckremoveplugin
}).then(editor => {
    let isStarted = true;
    ckeditor = editor;
    editor.model.document.on('change:data', (evt, data) => {
        if (!isStarted) {
            if (editor.getData() == "" || $('#txtStartDate').val() == '' || $("#txtEndDate").val() == '' || $('#frmTitle').val() == '') {
                $("#btnConfirm").prop('disabled', true);
            }
            else {
                $("#btnConfirm").prop('disabled', false);
            }
        }

        isStarted = false;
    });
}).catch(error => {
    console.error(error);
});

$(function () {
    var currentPath = window.location.pathname;

    var pathArray = currentPath.split('/');

    id = pathArray[pathArray.length - 1];

    $("#divsave").hide();
    $("#divsave").removeAttr("hidden");

    getData();

    $("#txtStartDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        orientation: "bottom"
    }).on('changeDate', function (selected) {
        var minDate = new Date(selected.date.valueOf());
        $("#txtEndDate").datepicker('setStartDate', minDate);
    });
    $("#txtEndDate").datepicker({
        format: 'yyyy-mm-dd',
        autoclose: true,
        orientation: "bottom",
        minDate: $("#txtStartDate").datepicker("getDate")
    }).on('changeDate', function (selected) {
        var minDate = new Date(selected.date.valueOf());
        $("#txtStartDate").datepicker('setEndDate', minDate);
    });
});

function getData() {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId
    };
    $.ajax({
        url: urlApiGlobal + '/notification/GetViewNews?Id=' + id,
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            var data = response.obj;
            const sDate = new Date(data.startDate);
            const eDate = new Date(data.endDate);

            const syear = sDate.getFullYear();
            const smonth = String(sDate.getMonth() + 1).padStart(2, "0");
            const sday = String(sDate.getDate()).padStart(2, "0");

            const eyear = eDate.getFullYear();
            const emonth = String(eDate.getMonth() + 1).padStart(2, "0");
            const eday = String(eDate.getDate()).padStart(2, "0");

            const formattedsDate = `${syear}-${smonth}-${sday}`;
            const formattedeDate = `${eyear}-${emonth}-${eday}`;
            $("#frmTitle").val(data.title);
            $("#txtStartDate").val(formattedsDate);
            $("#txtEndDate").val(formattedeDate);
            $("#cbstatus").attr("checked", data.isActive);

            const html = data.content;
            dataeditor = html;
            ckeditor.setData(dataeditor);

            isStatus = data.isActive;
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });

}

function convertDeltaToHtml(status) {
    //console.log(delta.ops);
    /*localStorage.removeItem("saveQuill");

    localStorage.setItem("saveQuill", JSON.stringify(delta));*/
    var isactive;
    if (status == 'Draft') {
        isactive = false;
    }
    else {
        isactive = true;
    }
    const html = ckeditor.getData();
    var url = "/Master/Notification";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': id,
        'Title': $("#frmTitle").val(),
        'StartDate': $("#txtStartDate").val(),
        'EndDate': $("#txtEndDate").val(),
        'Content': html,
        'Status': status,
        'IsActive': isactive //Jika status Send, maka true
    };
    $.ajax({
        url: urlApiGlobal + '/notification/CreateNews',
        type: "POST",
        data: JSON.stringify(dataObject),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        success: function (res) {
            var jsonString = JSON.stringify(res);
            if (res.code == 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Master News has been saved',
                    showConfirmButton: false,
                    text: 'We have saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 4000
                })
                setTimeout(function () { window.location.href = url; }, 3000);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Master News can't been saved",
                    showConfirmButton: true,
                    text: 'We cannot saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false
                })
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            Swal.fire({
                icon: 'error',
                title: "Master News can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}

$("#btnConfirmEdit").click(function () {
    $('#editModal').modal('hide');
    $(".isdisabled").prop("disabled", false);
    $("#divsave").show();
    $("#divedit").hide();
    ckeditor.disableReadOnlyMode("editor");
});

$("#btnCancel").click(function () {
    /*$(".isdisabled").prop("disabled", true);
    $("#divedit").show();
    $("#divsave").hide();
    ckeditor.enableReadOnlyMode("editor");*/
    window.location.reload();
});

$('#frmTitle').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    if ($('#frmTitle').val() == '' || $("#txtStartDate").val() == '' || $("#txtEndDate").val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
        $("#btnDraft").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
        $("#btnDraft").prop('disabled', false);
    }
});

$('#txtStartDate').on('change', function () {
    var ckvalue = ckeditor.getData();
    if ($('#frmTitle').val() == '' || $("#txtStartDate").val() == '' || $("#txtEndDate").val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
        $("#btnDraft").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
        $("#btnDraft").prop('disabled', false);
    }
});

$('#txtEndDate').on('change', function () {
    var ckvalue = ckeditor.getData();
    if ($('#frmTitle').val() == '' || $("#txtStartDate").val() == '' || $("#txtEndDate").val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
        $("#btnDraft").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
        $("#btnDraft").prop('disabled', false);
    }
});

$('#btnSave').on('click', function () {
    $('#saveModal').modal('hide');
    convertDeltaToHtml('Send');
});

$('#btnSaveDraft').on('click', function () {
    $('#draftModal').modal('hide');
    convertDeltaToHtml('Draft');
});