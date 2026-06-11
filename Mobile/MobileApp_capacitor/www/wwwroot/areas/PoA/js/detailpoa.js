let poaOutlet;
let poaProduct;
let poaMuda;
let appBtn = document.getElementById('approveid');
let payBtn = document.getElementById('paymentid');
let intprogramid;
let fleft;
let ffront;
let fright;

appBtn.addEventListener('click', function () {
    $('#approveHistory').modal('show');

    var divElement = document.getElementById("historyApproval");
    var reqBody = {
        'objRequestData': {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'IntProgramId': intprogramid
        }
    };
    let html;

    $.ajax({
        url: urlApiGlobal + '/POA/GetTimeLinePoaById_J',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        beforeSend: function () {
            html = '<div style="text-align: center;">' +
                '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
                '</div>';
            divElement.innerHTML = html;
        },
        success: function (response) {
            if (response.bitSuccess) {
                let count = 0;
                let description;
                let dttimeline;
                let icondot;
                html = '<ul class="timeline">';
                for (var item of response.objData) {
                    let opacity;
                    const originalDate = new Date(item.DtTimeLine);

                    const day = originalDate.getDate();
                    const month = monthNames[originalDate.getMonth()];
                    const year = originalDate.getFullYear();
                    const jam = originalDate.getHours();
                    const menit = originalDate.getMinutes().toString().padStart(2, '0');

                    if (item.TxtDescription == null || item.TxtDescription == '') {
                        description = '';
                    }
                    else {
                        description = '<p><i>' + item.TxtDescription + '</i></p>';
                    }

                    const formattedDate = `${day} ${month} ${year}, ${jam}:${menit}`;

                    if (item.DtTimeLine == null || item.DtTimeLine == '') {
                        dttimeline = item.TxtInfo + ' oleh ' + item.TxtBy;
                        opacity = ' style="opacity: 50%;"';
                    }
                    else {
                        dttimeline = item.TxtInfo + ' oleh ' + item.TxtBy + ' pada tanggal ' + formattedDate + ' WIB';
                        opacity = '';
                    }

                    if (count > 0) {
                        icondot = 'fa-circle-o';
                    }
                    else {
                        icondot = 'fa-dot-circle-o';
                    }

                    html += `<li>` +
                        `<i class="fa ${icondot}"></i>` +
                        `<div class="timeline-item" ${opacity}>` +
                        '<h3 class="timeline-header">' +
                        item.TxtStatus +
                        '</h3>' +
                        '<div class="timeline-body">' +
                        dttimeline +
                        description +
                        '</div>' +
                        '</div>' +
                        '</li>';
                    count++;
                }

                html += '</ul>'
                divElement.innerHTML = html;
            }
            else {
                let errhtml;
                errhtml = '<div style="text-align: center;">' +
                    '<i class="fa fa-warning"></i><span> Data gagal untuk dimuat</span>' +
                    '</div>';
                divElement.innerHTML = errhtml;
            }
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
});

/*payBtn.addEventListener('click', function () {
    $('#approveHistory').modal('show');
});*/

$(function () {
    let id;
    let currentPath = window.location.pathname;
    let pathArray = currentPath.split('/');

    id = pathArray[pathArray.length - 1];
    intprogramid = id;
    $(".isdisabled").hide();
    $(".lblinfo").hide();
    $(".isdisabled").removeAttr("hidden");
    $(".isdisabled").prop("disabled", true);
    getData(id);

});

$(document).on('click', '[name="skppaidto"]', function () {
    $('#skpmodal').modal('show');
    let idprogram;
    let idprogramoutlet;
    let idEl = $(this)[0].id;
    idprogram = idEl.split("|")[0];
    idprogramoutlet = idEl.split("|")[1];
    let divElement = document.getElementById("historySkp");
    let reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'PoaNo': idprogram,
        'PaidToId': idprogramoutlet
    };
    let html;

    $.ajax({
        url: urlApiGlobal + '/promotion/skp/getlisthistoryskp',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        beforeSend: function () {
            html = '<div style="text-align: center;">' +
                '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
                '</div>';
            divElement.innerHTML = html;
        },
        success: function (response) {
            if (response.code == 200) {
                let count = 0;
                let description;
                if (response.obj.length > 0) {
                    html = '';
                    for (var item of response.obj) {
                        let stitle;
                        let originalDate;

                        if (item.isUpdate) {
                            originalDate = new Date(item.updateDate);
                            stitle = 'Diupdate';
                        }
                        else {
                            originalDate = new Date(item.createdDate);
                            stitle = 'Dicreate';
                        }

                        const day = originalDate.getDate();
                        const month = monthNames[originalDate.getMonth()];
                        const year = originalDate.getFullYear();
                        const jam = originalDate.getHours();
                        const menit = originalDate.getMinutes().toString().padStart(2, '0');

                        const formattedDate = `${day} ${month} ${year}, ${jam}:${menit}`;

                        if (item.TxtDescription == null || item.TxtDescription == '') {
                            description = '';
                        }
                        else {
                            description = '<p><i>' + item.TxtDescription + '</i></p>';
                        }

                        html += `<div class="divhistoryskp">` +
                            `<h4><b>${item.documentNo}</b></h4>` +
                            `<p>${stitle} pada ${formattedDate}</p>` +
                            '</div>';
                        count++;
                    }

                    html += '</ul>'
                    divElement.innerHTML = html;
                }
                else {
                    html = `<div style="text-align: center;">` +
                        `<h4>Tidak ada history</h4>` +
                        '</div>';
                    divElement.innerHTML = html;
                }
            }
            else {
                let errhtml;
                errhtml = '<div style="text-align: center;">' +
                    '<i class="fa fa-warning"></i><span> Data gagal untuk dimuat</span>' +
                    '</div>';
                divElement.innerHTML = errhtml;
            }
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
});

$(document).on('click', '[name="paymentpaidto"]', function () {
    let idprogram;
    let idprogramoutlet;
    let idEl = $(this)[0].id;
    idprogram = idEl.split("|")[0];
    idprogramoutlet = idEl.split("|")[1];
    $('#paymentpaidtoHistory').modal('show');
    var divElement = document.getElementById("historyPaymentPaidto");
    var reqBody = {
        'objRequestData': {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'IntProgramId': idprogram,
            'IntProgramOutletId': idprogramoutlet
        }
    };
    let html;

    $.ajax({
        url: urlApiGlobal + '/POA/GetTimeLinePaidToById_J',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        beforeSend: function () {
            html = '<div style="text-align: center;">' +
                '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
                '</div>';
            divElement.innerHTML = html;
        },
        success: function (response) {
            if (response.bitSuccess) {
                if (response.objData.length > 0) {
                    let count = 0;
                    let icondot;
                    let description;
                    html = '<ul class="timeline">';
                    for (var item of response.objData) {
                        let opacity;
                        const originalDate = new Date(item.DtTimeLine);

                        const day = originalDate.getDate();
                        const month = monthNames[originalDate.getMonth()];
                        const year = originalDate.getFullYear();
                        const jam = originalDate.getHours();
                        const menit = originalDate.getMinutes().toString().padStart(2, '0');

                        if (count > 0) {
                            opacity = ' style="opacity: 50%;"';
                            icondot = 'fa-circle-o';
                        }
                        else {
                            opacity = '';
                            icondot = 'fa-dot-circle-o';
                        }

                        const formattedDate = `${day} ${month} ${year}, ${jam}:${menit}`;

                        if (item.TxtDescription == null || item.TxtDescription == '') {
                            description = '';
                        }
                        else {
                            description = '<p><i>' + item.TxtDescription + '</i></p>';
                        }

                        html += `<li>` +
                            `<i class="fa ${icondot}"></i>` +
                            `<div class="timeline-item" ${opacity}>` +
                            '<h3 class="timeline-header">' +
                            item.TxtStatus +
                            '</h3>' +
                            '<div class="timeline-body">' +
                            item.TxtInfo + ' oleh ' + item.TxtBy + ' pada tanggal ' + formattedDate + ' WIB' +
                            description +
                            '</div>' +
                            '</div>' +
                            '</li>';
                        count++;
                    }

                    html += '</ul>'
                    divElement.innerHTML = html;
                }
                else {
                    html = `<div style="text-align: center;">` +
                        `<h4>Tidak ada history payment</h4>` +
                        '</div>';
                    divElement.innerHTML = html;
                }
            }
            else {
                let errhtml;
                errhtml = '<div style="text-align: center;">' +
                    '<i class="fa fa-warning"></i><span> Data gagal untuk dimuat</span>' +
                    '</div>';
                divElement.innerHTML = errhtml;
            }
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
});

function getData(id) {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'objRequestData': {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'IntProgramId': id
        }
    };

    $.ajax({
        url: urlApiGlobal + '/prmadapter/syncdata/GetPoaByIdPRM',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            if (response.code == 200) {
                let datapoa = response.obj.objData.PoA;
                $("#frmNama").val(datapoa.TxtNamaProgram);
                $("#frmNo").val(datapoa.IntProgramId);
                $("#frmTipe").val(datapoa.TxtProgramType);
                $("#frmPayment").val(datapoa.TxtPaymentType);
                $("#frmTglmulai").val(datapoa.DtStartDate);
                $("#frmRequestor").val(datapoa.TxtRequestorName);
                $("#frmJenis").val(datapoa.TxtJenisProgramPoaName);
                $("#frmCoa").val(datapoa.TxtTipeProgramPoaName);
                $("#frmTipeAccount").val(datapoa.TxtAccountTypeName);
                $("#frmAverage").val(datapoa.DecAvgSls3Month);
                $("#frmTarget").val(datapoa.DecTargetSales);
                $("#frmTotal").val(datapoa.IntTotalBudget);
                $("#frmRatio").val(datapoa.DecRatio);
                $("#frmKode ").val(datapoa.TxtKodeSalur);
                $("#frmDivision").val(datapoa.TxtDivisionName);
                $("#frmDepartment").val(datapoa.TxtDepartmentName);
                $("#frmMemo").val(datapoa.IntMemoId);
                $("#frmDeskripsi").val(datapoa.TxtProgramDescription);
                $("#frmBackground").val(datapoa.TxtProgramBackground);
                $("#frmObtained").val(datapoa.TxtObtainedComp);
                $("#frmRemarks").val(datapoa.TxtProgramObjective);

                let stapproval = response.obj.objData.PoAStatus.TxtStatusName;
                let stpayment = datapoa.TxtStatusPayment;

                let colorapp = response.obj.objData.PoAStatus.objStatusColor;
                let borderapp = colorapp.TxtBorderColors;
                let fontapp = colorapp.TxtFontColors;
                let backgroundapp = colorapp.TxtBackgroundColors;
                if (borderapp == null) {
                    borderapp = backgroundapp;
                }

                $("#stapproval").text(stapproval.toLowerCase());
                //$("#stpayment").text(stpayment.toLowerCase());

                $("#stapproval").addClass("badge");
                $('#stapproval').css({
                    'border': '2px solid ' + borderapp,
                    'background-color': backgroundapp,
                    'color': fontapp
                });

                /*if (stapproval == "APPROVE") {
                    $("#stapproval").addClass("badge badge-primary");
                }
                else if (stapproval == "REJECT") {
                    $("#stapproval").addClass("badge badge-danger");
                }
                else if (stapproval == "DRAFT") {
                    $("#stapproval").addClass("badge badge-info");
                }
                else if (stapproval == "DONE WITH REVIEW") {
                    $("#stapproval").addClass("badge badge-dark");
                }
                else if (stapproval == "DONE") {
                    $("#stapproval").addClass("badge badge-wcupdate");
                }
                else if (stapproval == "CANCEL") {
                    $("#stapproval").addClass("badge badge-wcgrey");
                }
                else if (stapproval == "WAITING APPROVAL") {
                    $("#stapproval").addClass("badge badge-warning");
                }
                else {
                    $("#stapproval").addClass("badge badge-info");
                }*/

                let colorpay = response.obj.objData.PoA.objStatusPaymentColors;
                let borderpay = colorpay.TxtBorderColors;
                let fontpay = colorpay.TxtFontColors;
                let backgroundpay = colorpay.TxtBackgroundColors;
                let paddingnull = '';
                if (borderpay == null) {
                    borderpay = backgroundpay;
                }

                if (stpayment == "" || stpayment == null) {
                    $("#stpayment").text("-");
                    paddingnull = '20px';
                }
                else {
                    $("#stpayment").text(stpayment.toLowerCase());
                    paddingnull = '0px';
                }

                $("#stpayment").addClass("badge");
                $('#stpayment').css({
                    'border': '2px solid ' + borderpay,
                    'background-color': backgroundpay,
                    'color': fontpay,
                    'padding-inline': paddingnull
                });

                $(".isdisabled").show();
                $(".lblinfo").show();
                $(".shimmerBG").hide();

                poaOutlet = response.obj.objData.PoAOutlet;
                poaProduct = response.obj.objData.PoAProduct;
                poaMuda = response.obj.objData.PoAMuda[0];
                getTotalPaidto(poaOutlet);
                //tablePaidTo(poaOutlet);
                tableProduct(poaProduct);
                detailMuda(poaMuda);
            }
            else {

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

function detailMuda(data) {
    $("#frmDisplay").val(data.TxtDisplay);
    $("#frmUpdate").val(data.TxtUpdate);
    $("#frmFront").val(data.TxtFrontFileName);
    $("#frmLeft").val(data.TxtLeftFileName);
    $("#frmRight").val(data.TxtRightFileName);

    $("#aFront").val(data.TxtFrontFullUrl);
    $("#aLeft").val(data.TxtLeftFullUrl);
    $("#aRight").val(data.TxtRightFullUrl);

    fleft = data.TxtLeftFileName;
    fright = data.TxtRightFileName;
    ffront = data.TxtFrontFileName
}

$(document).on('click', '[name="downloadImage"]', function () {
    let imgurl = $(this)[0].value;
    let pathArray = imgurl.split('/');
    let filename = undefined;
    let pilihfile = pathArray[pathArray.length - 2];

    if (pilihfile == 'LEFT') {
        filename = fleft;
    }
    else if (pilihfile == 'FRONT') {
        filename = ffront;
    }
    else {
        filename = fright;
    }
    imgurl = imgurl.replace('Muda', 'MUDA');
    $.ajax({
        url: urlApiGlobal + imgurl,
        type: 'GET',
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
            a.download = filename;
            document.body.append(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("catch");
            console.log(textStatus);

        }
    });
})

function tablePaidTo(data) {
    $('#tblPaidTo').DataTable({
        "lengthChange": false,
        "ordering": false,
        processing: true,
        language: {
            "paginate": {
                "previous": "<",
                "next": ">"
            },
            processing: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span> ',

        },
        data: data,
        columnDefs: [
            {
                targets: 0,
                render: function (data, type, row, meta) {
                    return row.TxtNamaPaidTo;
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return row.objIdentitas.TxtKtpno;
                }
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    return row.objIdentitas.TxtNpwpno;
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    return row.objIdentitas.TxtRekeningNo;
                }
            },
            {
                targets: 4,
                render: function (data, type, row, meta) {
                    return row.objIdentitas.TxtBankName;
                }
            },
            {
                targets: 5,
                render: function (data, type, row, meta) {
                    return row.objIdentitas.TxtBankBranch;
                }
            },
            {
                targets: 6,
                render: function (data, type, row, meta) {
                    if (row.TotalPaidTo == undefined || row.TotalPaidTo == null || row.TotalPaidTo == '') {
                        return '-';
                    }
                    else {
                        return formatUang(row.TotalPaidTo);
                    }
                }
            },
            {
                width: "20%",
                targets: 7,
                render: function (data, type, row, meta) {
                    if (row.BitFlagSkp == true) {
                        return '<div class="inline"><div class="badge badge-fcsuccess">E-SKP</div>' +
                            '<img src="../../../assets/images/icons/help-icon.svg" class="img-icon sub-skp ic-info" id="' + row.IntProgramId + '|' + row.IntProgramOutletId + '" name="skppaidto"></div>';
                    }
                    else {
                        return '<div class="inline"><div class="badge badge-fclight">E-SKP</div>' +
                            '<img src="../../../assets/images/icons/help-icon.svg" class="img-icon sub-skp ic-info" id="' + row.IntProgramId + '|' + row.IntProgramOutletId + '" name="skppaidto"></div>';
                    }
                }
            },
            {
                width: "20%",
                targets: 8,
                render: function (data, type, row, meta) {
                    let html;
                    let txtpayment = row.TxtStatusPayment;
                    let color = row.objStatusPaymentColors;
                    let border = color.TxtBorderColors;
                    let font = color.TxtFontColors;
                    let background = color.TxtBackgroundColors;
                    let paddingnull = '';
                    if (border == null) {
                        border = background;
                    }

                    if (txtpayment == "" || txtpayment == null) {
                        txtpayment = '-';
                        paddingnull = 'padding-inline: 20px;';
                    }
                    else {
                        txtpayment = txtpayment;
                    }
                    html = '<div class="inline"><div class="badge" style="border: 2px solid ' + border + ' ; color:' + font + ' ; background-color:' + background + ';' + paddingnull + '">' + txtpayment + '</div>' +
                        '<img src="../../../assets/images/icons/help-icon.svg" class="img-icon sub-skp ic-info" id="' + row.IntProgramId + '|' + row.IntProgramOutletId + '" name="paymentpaidto"></div>';

                    return html;
                }
            },
            {
                targets: 9,
                render: function (data, type, row, meta) {
                    let objidentitas;
                    let iscomplete;
                    objidentitas = row.objIdentitas;

                    if ((objidentitas.TxtTelpNo && objidentitas.TxtTelpNo.trim()) &&
                        (objidentitas.TxtJabatanPICName && objidentitas.TxtJabatanPICName.trim()) &&
                        (objidentitas.TxtPicName && objidentitas.TxtPicName.trim()) &&
                        (objidentitas.TxtJabatanManagementName && objidentitas.TxtJabatanManagementName.trim()) &&
                        (objidentitas.TxtManagementName && objidentitas.TxtManagementName.trim()) &&
                        (objidentitas.TxtTelpNoManagement && objidentitas.TxtTelpNoManagement.trim())) {
                        iscomplete = '<div class="badge badge-fillsuccess">Data Sudah Lengkap</div>';
                    }
                    else {
                        iscomplete = '<div class="badge badge-filldanger">Data Belum Lengkap</div>';
                    }

                    return iscomplete;
                }
            },
            {
                targets: 10,
                render: function (data, type, row, meta) {
                    return '<a href="../../../PlanofActivity/PoA/PaidTo/' + row.IntProgramId + '-' + row.IntProgramOutletId + '"><i class="fa fa-angle-right"></i></a>';
                }
            },
        ]
    });

}

function getTotalPaidto(dataoutlet) {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'PoaNo': intprogramid
    };

    $.ajax({
        url: urlApiGlobal + '/promotion/kwitansi/getlistkwitansi',
        type: "POST",
        data: JSON.stringify(reqBody),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            let total = 0;
            if (response.code == 200) {
                let sumByPaidToId = {};

                response.obj.forEach(item => {
                    let paidToId = item.dataPaidTo.paidToId;
                    let totalAmount = item.totalAmountAfterTax;

                    if (!sumByPaidToId[paidToId]) {
                        sumByPaidToId[paidToId] = totalAmount;
                    } else {
                        sumByPaidToId[paidToId] += totalAmount;
                    }
                });

                for (const paidToId in sumByPaidToId) {
                    dataoutlet.filter(item => item.IntProgramOutletId == paidToId)[0].TotalPaidTo = sumByPaidToId[paidToId];
                }

                tablePaidTo(dataoutlet);
            }
            else {
                for (var i = 0; i < dataoutlet.length; i++) {
                    dataoutlet[i].TotalPaidTo = '';
                }

                tablePaidTo(dataoutlet);
            }
            $("#loadingTable").attr("style", "display: none !important");


        },
        failure: function (response) {
            for (var i = 0; i < dataoutlet.length; i++) {
                dataoutlet[i].TotalPaidTo = '';
            }

            tablePaidTo(dataoutlet);
            $("#loadingTable").attr("style", "display: none !important");
        },
        error: function (response) {
            for (var i = 0; i < dataoutlet.length; i++) {
                dataoutlet[i].TotalPaidTo = '';
            }

            tablePaidTo(dataoutlet);
            $("#loadingTable").attr("style", "display: none !important");
        }
    });
}

function formatUang(angka) {
    return new Number(angka).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR'
    });
}

function tableProduct(data) {
    $('#tblProduct').DataTable({
        "lengthChange": false,
        "ordering": false,
        language: {
            "paginate": {
                "previous": "<",
                "next": ">"
            },
            processing: '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span> ',

        },
        data: data,
        columnDefs: [
            {
                targets: 0,
                render: function (data, type, row, meta) {
                    return row.TxtBrandName;
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return row.DecContribute + '%';
                }
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    if (row.DecAchievementSales == null) {
                        return '-';
                    }
                    else {
                        return row.DecAchievementSales;
                    }
                }
            },
        ]
    });
}