var idpoa;
var idoutlet;
var activityplanid;
var intprogactivityplanid;
var idurl;
$(function () {
    let currentPath = window.location.pathname;
    let pathArray = currentPath.split('/');

    let getId = pathArray[pathArray.length - 1];
    idurl = getId;

    idpoa = getId.split("-")[0];
    idoutlet = getId.split("-")[1];

    const detaillink = document.getElementById("detailLink");
    const backlink = document.getElementById("backLink");
    const paidlink = document.getElementById("paidLink");

    let initialdetailHref = detaillink.getAttribute("href");
    let initialpaidHref = paidlink.getAttribute("href");
    let detailHref = initialdetailHref + '/' + idpoa;
    let paidHref = initialpaidHref + '/' + getId;

    detaillink.setAttribute("href", detailHref);
    paidlink.setAttribute("href", paidHref);
    backlink.setAttribute("href", paidHref);

    getData();
});

function getData() {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'IntProgramId': idpoa
    };

    var objdata = {
        'objRequestData': reqBody
    };
    $.ajax({
        url: urlApiGlobal + '/POA/GetPoaById_J',
        type: "POST",
        data: JSON.stringify(objdata),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            let data = response.objData.PoAOutlet;
            let mypoa = data.filter(item => item.IntProgramOutletId === parseInt(idoutlet));
            let datapoa = mypoa[0];

            let docOthers = datapoa.PoAActivityPlan[0].DocumentOthers;
            intprogactivityplanid = datapoa.PoAActivityPlan[0].IntProgramActivityPlanId;
            //$("#txtTitle").text(data[0].activityDetail.poaActivityPlanName);
            var s = '<option disabled selected hidden></option>';
            for (var item of docOthers) {
                s += '<option value="' + item + '">' + item + '</option>';
            }

            $("#frmKategori").html(s);

            $("#txtTitle").text(datapoa.PoAActivityPlan[0].TxtActivityPlanName);
            $(".nameload").show();
            $(".shimmerBG").hide();
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
}

function getBerkas() {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'PoaNo': idpoa,
        'PaidToId': idoutlet
    };

    $.ajax({
        url: urlApiGlobal + '/promotion/attachment/getlistattachmenttypeforcms',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            if (response.code == 200) {
                let data = response.obj;
                //$("#txtTitle").text(data[0].activityDetail.poaActivityPlanName);
                var s = '<option disabled selected hidden></option>';
                for (var item of data) {
                    s += '<option value="' + item.activityPlanDocId + '">' + item.txtDocumentName + '</option>';

                    if (item.activityDetail != null) {
                        activityplanid = item.activityDetail.poaActivityPlanId;
                    }
                }
                $("#frmKategori").html(s);
            }
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

    input.addEventListener("change", (e) => {
        let fileName = e.target.files[0].name;
        $("#titledoc").text(fileName);

        if ($('#frmKategori').val() == '' || $('#frmKategori').val() == null || e.target.files.length == 0) {
            $("#btnConfirm").prop('disabled', true);
        }
        else {
            $("#btnConfirm").prop('disabled', false);
        }
    })
});

function saveData(id) {
    const fileInput = document.getElementById('files');
    var url = `/PlanofActivity/PoA/PaidTo/${idurl}`;
    if (fileInput.files.length > 0) {
        let fileName = fileInput.files[0].name;
        let filetype = fileInput.value.split(".").pop();

        var formData = new FormData();

        formData.append('File', fileInput.files[0]);
        formData.append('AppCode', 'Falcon');
        formData.append('TransactionType', 'PoA');
        formData.append('TransactionNo', generateGUID());
        formData.append('DocumentType', filetype);
        formData.append('TxtGUI_trUserLogin', txtGui);
        formData.append('IntCabangID', IntCabangId);
        formData.append('IntCabangPrimaryID', IntCabangId);
        formData.append('TxtUserID', TxtUserId);
        formData.append('PoaActivityPlanId', intprogactivityplanid);
        formData.append('ActivityPlanDocId', "-");
        formData.append('ActivityDocumentDetailId', id);
        $.ajax({
            url: urlApiGlobal + '/document/resourcedoc/uploadattachmentinpaidto',
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
                if (response.code == 200) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Document has been saved',
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
                        title: "Document can't been saved",
                        showConfirmButton: true,
                        text: textStatus,
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        timer: 5000
                    })
                    //setTimeout(function () { window.location.href = url; }, 4000);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                Swal.fire({
                    icon: 'error',
                    title: "Document can't been saved",
                    showConfirmButton: true,
                    text: textStatus,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 5000
                })
                //setTimeout(function () { window.location.href = url; }, 4000);
            }
        });
    }
}

function createDocumentDetail() {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'PoaActivityPlanId': intprogactivityplanid,
        'PaidToId': idoutlet,
        'TxtDocumentName': $("#frmKategori").val()
    };

    $.ajax({
        url: urlApiGlobal + '/promotion/attachment/createactivitydocumentdetail',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            if (response.code == 200) {
                saveData(response.obj.id);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Document can't been created",
                    showConfirmButton: true,
                    text: textStatus,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 5000
                });
            }
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            Swal.fire({
                icon: 'error',
                title: "Document can't been created",
                showConfirmButton: true,
                text: textStatus,
                allowOutsideClick: false,
                allowEscapeKey: false,
                timer: 5000
            });
        }
    });
}

$('#btnSave').on('click', function () {
    $('#saveModal').modal('hide');
    createDocumentDetail();
});

$('#frmKategori').change(function () {
    const fileInput = document.getElementById('files');
    if ($('#frmKategori').val() == '') {
        Swal.fire({
            title: 'SKP dan Kwitansi hanya bisa upload file di aplikasi mobile',
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            }
        })
    }

    if ($('#frmKategori').val() == '' || fileInput.files.length == 0) {
        $("#btnConfirm").prop('disabled', true);
    }
    else {
        $("#btnConfirm").prop('disabled', false);
    }
});