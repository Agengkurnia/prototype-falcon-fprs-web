let ckeditor;

$(function () {
    localStorage.removeItem("attachmentFAQ");
    GetKategori();
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
    ckeditor = editor;
    editor.model.document.on('change:data', (evt, data) => {
        if (editor.getData() == "" || $('#frmKategori').val() == '' || $('#frmTitle').val() == '') {
            $("#btnConfirm").prop('disabled', true);
        }
        else {
            $("#btnConfirm").prop('disabled', false);
        }
    });
}).catch(error => {
    console.error(error);
});

function validateFile() {
    var fileInput = document.getElementById('files');
    var errorMessage = document.getElementById('error-message');

    if (fileInput.files.length > 0) {
        var fileSize = fileInput.files[0].size; // Ukuran file dalam byte
        var maxSize = 2 * 1024 * 1024; // 2 MB (dalam byte)

        if (fileSize > maxSize) {
            errorMessage.textContent = 'Ukuran file terlalu besar. Maksimum file 2MB.';
            fileInput.value = ''; // Reset input file
        } else {
            errorMessage.textContent = '';
        }
    }
}

function GetKategori() {
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
            }
            $("#frmKategori").html(s);
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
}

window.addEventListener("load", () => {
    const input = document.getElementById("files");
    const filewrapper = document.getElementById("filewrapper");
    const previewImage = document.getElementById('previewImage');

    input.addEventListener("change", (e) => {
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
        // Lakukan permintaan Ajax dengan jQuery
        $.ajax({
            url: urlApiGlobal + '/document/resourcedoc/uploaddocument',
            type: 'POST',
            data: formData,
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            processData: false,
            contentType: false, // Ini yang penting untuk format multipart/form-data
            success: function (response) {
                let resourceid = response.obj.resourceId;

                const file = e.target.files[0];
                if (file) {
                    /*const reader = new FileReader();

                    reader.onload = function (event) {
                        previewImage.style.display = 'block';
                        previewImage.src = event.target.result;
                    }

                    reader.readAsDataURL(file);*/

                    fileshow(fileName, filetype, file, resourceid);
                    setFile(fileName, resourceid);
                }
            }
        });

        //fileshow(fileName, filetype);
    })
});

const fileshow = (fileName, filetype, myFile, resourceid) => {
    const showfileboxElem = document.createElement("div");
    showfileboxElem.classList.add("showfilebox");
    showfileboxElem.id = resourceid;
    const leftElem = document.createElement("div");
    leftElem.classList.add("left");

    if (['PNG', 'JPG', 'JPEG', 'JFIF', 'BMP'].includes(filetype.toUpperCase())) {
        const reader = new FileReader();
        const fileTypeElem = document.createElement("img");
        fileTypeElem.classList.add("imgtype");
        reader.onload = function (event) {
            fileTypeElem.src = event.target.result;
        }
        reader.readAsDataURL(myFile);

        leftElem.append(fileTypeElem);
    }
    else {
        const fileTypeElem = document.createElement("span");
        fileTypeElem.classList.add("filetype");
        fileTypeElem.innerHTML = filetype;
        leftElem.append(fileTypeElem);
    }

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
    rightElem.append(crossElem);
    filewrapper.append(showfileboxElem);

    crossElem.addEventListener("click", () => {
        var formDelete = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'ResourceId': showfileboxElem.id
        };
        $.ajax({
            url: urlApiGlobal + '/document/resourcedoc/deletedocument',
            type: 'POST',
            data: JSON.stringify(formDelete),
            headers: {
                "Authorization": "Bearer " + AccessToken
            },
            success: function (response) {
                let resourceid = response;
            }
        });
        filewrapper.removeChild(showfileboxElem);

        //delete from localstorage

        var myData = localStorage.getItem("attachmentFAQ");
        var data_array = JSON.parse(myData);

        for (let i = 0; i < data_array.length; i++) {
            if (data_array[i].ResourceId === showfileboxElem.id) {
                data_array.splice(i, 1);
                i--;
            }
        }

        localStorage.removeItem("attachmentFAQ");
        localStorage.setItem("attachmentFAQ", JSON.stringify(data_array));
    });

    filetitleElem.addEventListener("click", () => {
        var formDownload = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'ResourceId': filetitleElem.id
        };
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
            success: function (response) {
                let resourceid = response;
            }
        });
    });
}

function setFile(filename, resourceid) {
    const param = {
        ResourceId: resourceid,
        FileName: filename
    };

    let attachment = localStorage.getItem("attachmentFAQ");
    attachment = attachment ? JSON.parse(attachment) : [];
    attachment.push(param);

    localStorage.setItem("attachmentFAQ", JSON.stringify(attachment));
}

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
    if (this.value == '' || $('#frmKategori').val() == '' || $('#frmKategori').val() == null || ckvalue == '') {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});

$('#btnSave').on('click', function () {
    $('#saveModal').modal('hide');
    saveData();
});

function saveData() {
    var param = localStorage.getItem("attachmentFAQ");
    var data_array = JSON.parse(param);
    var html = ckeditor.getData();
    var url = "/Master/FAQ";
    var dataObject = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'Id': null,
        'FaqMasterCategoryId': $('#frmKategori').val(),
        'Title': $("#frmTitle").val(),
        'Content': html,
        'FaqDocuments': data_array
    };
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
                localStorage.removeItem("attachmentFAQ");
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