var slideon = new Slideon();
var isStatus;
var toStatus = document.getElementById("cbstatus");
var btnUpload = document.getElementById("btnUpload");
var iDelete = document.querySelectorAll(".icon-trash");
var dataeditor;
var listmodul = [];
let ckeditor;
let documentid;
let filebox;

var id;
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

toStatus.addEventListener('click', () => {
    $("#btnConfirm").prop('disabled', false);
    isStatus = toStatus.checked;
})

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
    editor.enableReadOnlyMode("editor");
    editor.model.document.on('change:data', (evt, data) => {
        if (!isStarted) {
            if (editor.getData() == "" || $('#frmKategori').val() == '' || $('#frmTitle').val() == '') {
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

    localStorage.removeItem("editAttachFAQ");

    $(".isdisabled").prop("disabled", true);
    $("#divsave").hide();
    $("#divsave").removeAttr("hidden");
    //quill.enable(false);

    executeAJAX();
});

function GetKategori() {
    return new Promise((resolve, reject) => {
        var dataObject = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
        };
        $.ajax({
            url: urlApiGlobal + '/setting/faq/getlistfaqmastercategoryactive',
            type: "POST",
            data: JSON.stringify(dataObject),
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                var s = '<option disabled selected hidden></option>';
                for (var i = 0; i < response.obj.length; i++) {
                    s += '<option value="' + response.obj[i].id + '">' + response.obj[i].title + '</option>';
                    listmodul.push(response.obj[i].id);
                }
                $("#frmKategori").html(s);
                resolve('get Kategori');
            },
            failure: function (response) {
                alert(response.d);
                resolve('get Kategori');
            },
            error: function (response) {
                alert(response.d);
                resolve('get Kategori');
            }
        });

    });
}

function getData() {
    return new Promise((resolve, reject) => {
        var reqBody = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'FaqMasterId': id
        };
        $.ajax({
            url: urlApiGlobal + '/setting/faq/getfaqdetail',
            type: "POST",
            data: JSON.stringify(reqBody),
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                var data = response.obj;

                if (!listmodul.includes(data.categoryId)) {
                    var s = '<option value="' + data.categoryId + '">' + data.category + '</option>';
                    $("#frmKategori").append(s).trigger('change');;
                }

                $("#frmTitle").val(data.title);
                //$("#frmKategori").text(data.category);
                $("#frmKategori option").each(function () {
                    if ($(this).text() === data.category) {
                        $(this).prop("selected", true);
                        return false;
                    }
                });
                $("#cbstatus").attr("checked", data.isActive);

                const html = data.content;
                dataeditor = html;
                ckeditor.setData(dataeditor);

                isStatus = data.isActive;
                //quill.setContents(delta, 'silent')

            },
            failure: function (response) {
                alert(response.d);
            },
            error: function (response) {
                alert(response.d);
            }
        });
        resolve('get Data');
    });

}

function getAttachment() {
    return new Promise((resolve, reject) => {
        var reqBody = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'FaqMasterId': id
        };
        $.ajax({
            url: urlApiGlobal + '/setting/faq/getlistfaqdocument',
            type: "POST",
            data: JSON.stringify(reqBody),
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            dataType: "json",
            contentType: "application/json",
            success: function (response) {
                var data = response.obj;
                console.log(response);
                var attachment = [];
                for (const element of data) {
                    const filename = element.fileName;
                    const parts = element.fileName.split(".");
                    const filetype = parts[parts.length - 1];
                    const resourceid = element.resourceId;

                    fileshow(filename, filetype, resourceid);

                    var param = {
                        ResourceId: element.resourceId,
                        FileName: element.fileName
                    };

                    attachment.push(param);

                    localStorage.setItem("editAttachFAQ", JSON.stringify(attachment));
                }

                iDelete = document.querySelectorAll(".icon-trash");
                var parameter = localStorage.getItem("editAttachFAQ");
            },
            failure: function (response) {
                alert(response.d);
            },
            error: function (response) {
                alert(response.d);
            }
        });
        resolve('get Data');
    });
}

window.addEventListener("load", () => {
    const input = document.getElementById("files");
    const filewrapper = document.getElementById("filewrapper");
    const previewImage = document.getElementById('previewImage');

    input.addEventListener("change", (e) => {
        $("#btnConfirm").prop('disabled', false);
        let fileName = e.target.files[0].name;
        let filetype = e.target.value.split(".").pop();

        var formData = new FormData();

        formData.append('File', e.target.files[0]);
        formData.append('AppCode', 'Falcon');
        formData.append('TransactionType', 'MasterFAQ');
        formData.append('TransactionNo', generateGUID());
        formData.append('DocumentType', filetype);
        formData.append('TxtGUI_trUserLogin', txtGui);
        formData.append('IntCabangID', IntCabangId);
        formData.append('IntCabangPrimaryID', IntCabangId);
        formData.append('TxtUserID', TxtUserId);
        $.ajax({
            url: urlApiGlobal + '/document/resourcedoc/uploaddocument',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            success: function (response) {
                let resourceid = response.obj.resourceId;
                console.log(response);
                const file = e.target.files[0];
                if (file) {

                    fileshow(fileName, filetype, file, resourceid);
                    setFile(fileName, resourceid);
                    $(".isdisabled").prop("disabled", false);
                }
            }
        });

        //fileshow(fileName, filetype);
    })
});

const fileshow = (fileName, filetype, resourceid) => {
    const showfileboxElem = document.createElement("div");
    showfileboxElem.classList.add("showfilebox");
    showfileboxElem.id = resourceid;
    const leftElem = document.createElement("div");
    leftElem.classList.add("left");
    const fileTypeElem = document.createElement("span");
    fileTypeElem.classList.add("filetype");
    fileTypeElem.innerHTML = filetype;
    leftElem.append(fileTypeElem);
    const filetitleElem = document.createElement("h3");
    filetitleElem.innerHTML = fileName;
    filetitleElem.id = resourceid;
    leftElem.append(filetitleElem);
    showfileboxElem.append(leftElem);
    const rightElem = document.createElement("div");
    rightElem.classList.add("right");
    showfileboxElem.append(rightElem);
    const crossElem = document.createElement("i");
    crossElem.classList.add("fa");
    crossElem.classList.add("fa-trash");
    crossElem.classList.add("icon-trash");
    crossElem.classList.add("isdisabled");
    rightElem.append(crossElem);
    filewrapper.append(showfileboxElem);

    crossElem.addEventListener("click", () => {
        $("#btnConfirm").prop('disabled', false);
        $('#deleteDokumenModal').modal('show');
        documentid = showfileboxElem.id;
        filebox = showfileboxElem;
    });

    filetitleElem.addEventListener("click", () => {
        var formDownload = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'ResourceId': filetitleElem.id
        };
        console.log(formDownload);
        $.ajax({
            url: urlApiGlobal + '/document/resourcedoc/downloaddocument',
            cache: false,
            type: 'POST',
            data: JSON.stringify(formDownload),
            contentType: "application/json",
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            xhrFields: {
                responseType: 'blob'
            },
            success: function (data) {
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(data);
                a.href = url;
                a.download = fileName;
                document.body.append(a);
                a.click();
                a.remove();
                console.log(url);
                window.URL.revokeObjectURL(url);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("catch");
                console.log(textStatus);

            }
        });
    });
}

$("#btnDeleteDokumen").click(function () {
    var myData = localStorage.getItem("editAttachFAQ");
    var data_array = JSON.parse(myData);

    for (let i = 0; i < data_array.length; i++) {
        if (data_array[i].ResourceId === documentid) {
            data_array.splice(i, 1);
            i--;
        }
    }
    localStorage.removeItem("editAttachFAQ");
    localStorage.setItem("editAttachFAQ", JSON.stringify(data_array));
    filewrapper.removeChild(filebox);
    $('#deleteDokumenModal').modal('hide');
});

async function executeAJAX() {
    try {
        const result1 = await GetKategori();

        const result2 = await getData();

        const result3 = await getAttachment();

    } catch (error) {
        console.error('Terjadi kesalahan:', error);
    }
}

function setFile(filename, resourceid) {
    const param = {
        ResourceId: resourceid,
        FileName: filename
    };

    let attachment = localStorage.getItem("editAttachFAQ");
    attachment = attachment ? JSON.parse(attachment) : [];
    attachment.push(param);

    localStorage.setItem("editAttachFAQ", JSON.stringify(attachment));
}

$("#btnConfirmEdit").click(function () {
    $('#editModal').modal('hide');
    $(".isdisabled").prop("disabled", false);
    $("#divsave").show();
    $("#divedit").hide();
    btnUpload.classList.remove("isdisabled");
    for (let i = 0; i < iDelete.length; i++) {
        iDelete[i].classList.remove("isdisabled");
    }
    ckeditor.disableReadOnlyMode("editor");
});

$("#btnCancel").click(function () {
    /*$(".isdisabled").prop("disabled", true);
    $("#divedit").show();
    $("#divsave").hide();
    btnUpload.classList.add("isdisabled");
    for (let i = 0; i < iDelete.length; i++) {
        iDelete[i].classList.add("isdisabled");
    }
    ckeditor.enableReadOnlyMode("editor");*/
    window.location.reload();
});

$('#frmKategori').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    if (this.value == '' || $('#frmTitle').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#frmTitle').on('keyup change', function () {
    var ckvalue = ckeditor.getData();
    if (this.value == '' || $('#frmKategori').val() == '' || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#btnSave').on('click', function () {
    $('#paramModal').modal('hide');
    saveData();
});

function saveData() {
    var param = localStorage.getItem("editAttachFAQ");
    var data_array = JSON.parse(param);
    var html = ckeditor.getData();
    var url = "/Master/FAQ";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': id,
        'IsActive': isStatus,
        'FaqMasterCategoryId': $('#frmKategori').val(),
        'Title': $("#frmTitle").val(),
        'Content': html,
        'FaqDocuments': data_array
    };

    console.log(dataObject);
    $.ajax({
        url: urlApiGlobal + '/setting/faq/createfaqmaster',
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
                    title: 'Master FAQ has been saved',
                    showConfirmButton: false,
                    text: 'We have saved your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 4000
                })
                localStorage.removeItem("editAttachFAQ");
                setTimeout(function () { window.location.href = url; }, 3000);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Master FAQ can't been saved",
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
                title: "Master FAQ can't been saved",
                showConfirmButton: true,
                text: errorThrown,
                allowOutsideClick: false,
                allowEscapeKey: false
            })
        }
    });
}