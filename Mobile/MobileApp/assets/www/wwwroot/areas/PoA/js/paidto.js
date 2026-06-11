let poaOutlet;
let oTable;
let gpoa;
let goutlet;
let getId;
let kategori;
let rowchild;
var activityplanid;
let poacantedit;
let statuspayment;
let isvalidatepoa;
let iserrormsg;
var slideon = new Slideon();
slideon.load()

function Slideon() {
    this.load = function () {
        var elements = document.querySelectorAll('.slideon.slideon-auto');
        elements.forEach(function (element) {
            var wrapper = document.createElement('label')
            wrapper.className = element.classList

            var slider = document.createElement('span')
            slider.className = 'slideon-slider'

            element.after(wrapper)
            wrapper.appendChild(element)
            element.after(slider)

            element.addEventListener('click', () => {
                element.classList.remove("slideon-auto")
                var wrapper = document.createElement('label')
                wrapper.className = element.classList

                var slider = document.createElement('span')
                slider.className = 'slideon-slider'

                element.after(wrapper)
                wrapper.appendChild(element)
                element.after(slider)
            });
        });
    }
}

$(function () {
    let idpoa;
    let idoutlet;
    let currentPath = window.location.pathname;
    let pathArray = currentPath.split('/');

    getId = pathArray[pathArray.length - 1];

    idpoa = getId.split("-")[0];
    idoutlet = getId.split("-")[1];
    $(".nameload").hide();
    $(".nameload").removeAttr("hidden");
    $(".isdisabled").prop("disabled", true);

    const link = document.getElementById("detailLink");
    const blink = document.getElementById("backLink");
    
    let initialHref = link.getAttribute("href");
    let newHref = initialHref + '/' + idpoa;
    gpoa = idpoa;
    goutlet = idoutlet;
    link.setAttribute("href", newHref);
    blink.setAttribute("href", newHref);
    getValidatePoa(idpoa, idoutlet);
    
});

function getData(id, idoutlet) {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'IntProgramId': id
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
            if (response.bitError) {
                console.log('retry');
                getData(id, idoutlet)
            }
            else {
                let data = response.objData.PoAOutlet;
                let mypoa = data.filter(item => item.IntProgramOutletId === parseInt(idoutlet));
                let datapoa = mypoa[0];

                statuspayment = response.objData.PoA.TxtStatusPayment;
                /* VIEW PARTNER */
                $("#aviewpartner").attr("href", datapoa.TxtUrlProfilePartner);
                /* END VIEW PARTNER */
                /* IDENTITAS */
                $("#frmNo").val(datapoa.objIdentitas.TxtNo);
                $("#frmTypePaid").val(datapoa.objIdentitas.TxtPaidTo);
                $("#frmNamaPaid").val(datapoa.objIdentitas.TxtNamaPaidTo);
                $("#frmBadanUsaha").val(datapoa.objIdentitas.TxtTypeBadanUsaha);
                $("#frmNoKtp").val(datapoa.objIdentitas.TxtKtpno);
                $("#frmNamaKtp").val(datapoa.objIdentitas.TxtNamaNpwp);
                $("#frmAlamatKtp").val(datapoa.objIdentitas.TxtAlamatPaidTo);
                $("#frmNoNpwp").val(datapoa.objIdentitas.TxtNpwpno);
                $("#frmAlamatNpwp").val(datapoa.objIdentitas.TxtAlamatNpwp);
                $("#frmNamaNpwp").val(datapoa.objIdentitas.TxtKtpName);
                $("#frmAlamatNpwp").val(datapoa.objIdentitas.TxtAlamatNpwp);
                /* END IDENTITAS */
                /* KONTAK */
                $("#frmNamaManagement").val(datapoa.objIdentitas.TxtManagementName);
                $("#frmJabatanManagement ").val(datapoa.objIdentitas.TxtJabatanManagementName);
                $("#frmNoTlpManagement").val(datapoa.objIdentitas.TxtTelpNoManagement);
                $("#frmEmailManagement").val(datapoa.objIdentitas.TxtEmailManagement);
                $("#frmNamaPIC").val(datapoa.objIdentitas.TxtPicName);
                $("#frmJabatanPIC").val(datapoa.objIdentitas.TxtJabatanPICName);
                $("#frmTlpPIC").val(datapoa.objIdentitas.TxtTelpNo);
                $("#frmEmailPic").val(datapoa.objIdentitas.TxtJabatanPICName);
                $("#frmInformasiTambahan").val(datapoa.objIdentitas.TxtInformasiTambahan);
                /* END KONTAK */
                /* PAYMENT INFO */
                $("#frmNomorRekening").val(datapoa.objIdentitas.TxtRekeningNo);
                $("#frmNamaRekening").val(datapoa.objIdentitas.TxtNamaPemilik);
                $("#frmNamaBank").val(datapoa.objIdentitas.TxtBankName);
                $("#frmAlamatBank").val(datapoa.objIdentitas.TxtBankAddress);
                $("#frmCabang").val(datapoa.objIdentitas.TxtBankBranch);
                $('#frmShowLov').prop('checked', datapoa.objIdentitas.BitShowLov);
                $('#frmActive').prop('checked', datapoa.objIdentitas.BitShowLov);

                $("#frmNamaPaid").val(datapoa.objIdentitas.TxtNamaPaidTo);

                $("#titlename").text(datapoa.objIdentitas.TxtNamaPaidTo);
                $(".nameload").show();
                $(".shimmerBG").hide();

                //datapoa.PoAActivityPlan[0].Total = response.objData.PoA.IntTotalBudget;
                tableSupportingDoc(datapoa.PoAActivityPlan);
            //getTotal(datapoa.PoAActivityPlan);
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

function getSettlement(idpoa, idoutlet) {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId
    };

    var objdata = {
        'objRequestData': reqBody
    };
    $.ajax({
        url: urlApiGlobal + '/System/DownloadDataConfig_J',
        type: "POST",
        data: JSON.stringify(objdata),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            let data = response.objData;
            let mypoa = data.filter(item => item.TxtKeyId === "POA_DOCUMENT_CANT_EDIT");
            let datapoa = mypoa[0];
            let txtvalue;

            try {
                txtvalue = JSON.parse(datapoa.TxtValue);
            }
            catch {
                txtvalue = ['null'];
            }
            
            poacantedit = txtvalue;
            getData(idpoa, idoutlet);
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
}

function getValidatePoa(idpoa, idoutlet) {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        "IntProgramId": gpoa,
        "IntJabatanId": TxtJabatanId
    };

    var objdata = {
        'objRequestData': reqBody
    };
    $.ajax({
        url: urlApiGlobal + '/poa/ValidateAttachmentPoA_J',
        type: "POST",
        data: JSON.stringify(objdata),
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        dataType: "json",
        contentType: "application/json",
        success: function (response) {
            if (response.bitSuccess) {
                isvalidatepoa = response.objData;
            }
            //iserrormsg = response.txtMessage;
            iserrormsg = 'Anda tidak dapat melakukan proses ini!'
            
            getData(idpoa, idoutlet);
        },
        failure: function (response) {
            alert(response.d);
        },
        error: function (response) {
            alert(response.d);
        }
    });
}

function tableSupportingDoc(data) {
    oTable = $('#tblSupportDoc').DataTable({
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
                defaultContent: '', targets: 0, class: 'dt-control', orderable: false,
                data: null,
                render: function (data, type, row, meta) {
                    return '<i class="fa fa-plus-square-o" style="cursor: pointer;"></i>';
                }
            },
            {
                targets: 1,
                render: function (data, type, row, meta) {
                    return row.TxtActivityPlanName;
                }
            },
            {
                targets: 2,
                render: function (data, type, row, meta) {
                    return formatUang(row.DecBudgetAmount);
                }
            },
            {
                targets: 3,
                render: function (data, type, row, meta) {
                    /*let issettlement;
                    issettlement = poacantedit.filter(item => item === statuspayment);*/        // supporting document by settlement


                    if (poaisedit && isvalidatepoa) {
                        return '<a href="../../../PlanofActivity/PoA/TambahBerkas/' + getId + '" class="linked">Tambah Berkas<i class="fa fa-plus-square-o berkas"></i></a>';
                    }
                    else {
                        return '';
                    }
                }
            },
        ],
        "fnDrawCallback": function () {
            var slideon = new Slideon();
            slideon.load();
        },
    });

    oTable.on('click', 'td.dt-control', function (e) {
        let tr = e.target.closest('tr');
        let row = oTable.row(tr);
        let icon = e.target.closest('i');
        
        var tdId = $(this).attr('id');

        // Lakukan apa pun yang Anda inginkan dengan ID tersebut
        //console.log('ID dari elemen <td> yang diklik:', tdId);

        if (row.child.isShown()) {
            icon.classList.remove('fa-minus-square-o');
            icon.classList.add('fa-plus-square-o');
            row.child.hide();
        }
        else {
            if (icon.classList.contains("fa-plus-square-o")) {
                icon.classList.remove('fa-plus-square-o');
            }
            icon.classList.add('fa-minus-square-o');
            rowchild = row;
            showAttachment(row);
        }
    });
}

function showAttachment(row) {
    let isdisabledelete;
    let issettlement;
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'PoaNo': gpoa,
        'PaidToId': goutlet
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
        beforeSend: function () {
            let html = '<div style="text-align: center;">' +
                '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
                '</div>';
            row.child(html).show();
        },
        success: function (response) {
            let iskwitansi = '';

            //issettlement = poacantedit.filter(item => item === statuspayment);
            if (response.code == 200) {
                let data = response.obj;
                let sthtml;
                var ihtml = '<table style="width: 100%;">';
                ihtml += '<tr style="background-color: #f1f7e5; height: 50px; width: 100%;">' +
                    '<td style="min-width:150px;"><b>Nama Document</b></td>' +
                    '<td style="min-width:155px;"><b>Date</b></td>' +
                    '<td><b>Nama File</b></td>' +
                    '<td><b>Version</b></td>' +
                    '<td><b>Sub Total</b></td>' +
                    '<td><b>Status</b></td>' +
                    '<td></td>' +
                    '</tr>';
                for (var item of data) {
                    let isdisableactive = '';
                    let isdisableaupload = '';

                    if (!poaisedit) {
                        isdisableaupload = 'disableupload';
                        isdisableactive = 'disabled';
                    }

                    if (item.txtDocumentName.toLowerCase() == 'skp') {
                        isdisableaupload = 'disableupload';
                        isdisableactive = 'disabled';
                    }

                    if (item.txtDocumentName.toLowerCase() == 'kwitansi') {
                        isdisableaupload = 'disableupload';
                        iskwitansi = 'iskwitansi';
                    }
                    else {
                        iskwitansi = '';
                    }

                    if (item.activityDetail != null) {
                        activityplanid = item.activityDetail.poaActivityPlanId;
                    }

                    /*if (issettlement.length > 0) {
                        //isdisableaupload = 'disableupload';
                    }*/

                    sthtml = '<div class="dvAction"><img src="../../../assets/images/icons/upload.svg" class="img-icon img-download ' + isdisableaupload + '" id="' + item.activityPlanDocId + '" name="uploadparam"></div>';

                    if ((item.activityPlanDocId == null || item.activityPlanDocId == '') && isdisableaupload == '') {
                        sthtml = '';
                    }

                    ihtml += '<tr style="background-color: #f2f4f6;">' +
                        `<td>${item.txtDocumentName}</td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td></td>` +
                        `<td>${sthtml}</td>` +
                        '</tr>';

                    let docdata;
                    let docname;
                    let bgisactive;
                    let ischecked;
                    let totaluang;
                    let versiondoc;

                    let subloop = 0;

                    if (item.attachmentDocumentDetails != null) {
                        docdata = item.attachmentDocumentDetails;
                        for (var subitems of docdata) {
                            let versiondoc = '';
                            const originalDate = new Date(subitems.date);

                            //originalDate.setHours(originalDate.getHours() + 7);
                            originalDate.setHours(originalDate.getHours());

                            const day = originalDate.getDate();
                            const month = monthNames[originalDate.getMonth()];
                            const year = originalDate.getFullYear();
                            const jam = originalDate.getHours().toString().padStart(2, '0');
                            const menit = originalDate.getMinutes().toString().padStart(2, '0');

                            const formattedDate = `${day} ${month} ${year}, ${jam}:${menit}`;

                            if (item.txtDocumentName.toLowerCase() == 'kwitansi' || item.txtDocumentName.toLowerCase() == 'skp') {
                                isdisabledelete = 'disabled';
                                versiondoc = subitems.versionDoc;
                                totaluang = formatUang(subitems.subTotal);

                                if ((item.txtDocumentName.toLowerCase() == 'kwitansi' && !subitems.isEditable)) {
                                    isdisableactive = 'disabled';
                                }
                                else {
                                    isdisableactive = '';
                                }
                            }
                            else {
                                isdisableactive = '';
                                isdisabledelete = '';

                                if (subitems.subTotal == 0) {
                                    totaluang = '';
                                }
                                else {
                                    totaluang = formatUang(subitems.subTotal);
                                }
                            }

                            if (!poaisedit) {
                                isdisableactive = 'disabled';
                            }

                            if (!poaisdelete) {
                                isdisabledelete = 'disabled';
                            }

                            if (subloop == 0) {
                                docname = item.txtDocumentName;
                            }
                            else {
                                docname = '';
                            }

                            if (subitems.isActive) {
                                bgisactive = '<div class="badge badge-active statusattach">Active</div>';
                                ischecked = 'checked';
                            }
                            else {
                                bgisactive = '<div class="badge badge-nonactive statusattach">Non Active</div>';
                                ischecked = '';
                            }

                           /* if (issettlement.length > 0) {
                                //isdisabledelete = 'disabled';
                                //isdisableactive = 'disabled';
                            }*/

                            sthtml = '<div class="dvAction"><img src="../../../assets/images/icons/download.svg" class="img-icon img-download" data-filename="' + subitems.fileName + '" data-resourceid="' + subitems.resourceId + '" name="downloaddata">' +
                                '<a href="#" data-toggle="modal" class="icon-param-edit" data-filename="' + subitems.fileName + '" data-resourceid="' + subitems.resourceId + '" name="viewdata"><i class="fa fa-eye"></i></a>' +
                                '<label class="slideon slideon-auto slideon-xs isdisabled datatoogle"><input type="checkbox" id="' + subitems.id + '" value="' + item.documentGeneralType + '" class="slideon slideon-auto slideon-xs datatoogle incheck ' + iskwitansi + '" ' + ischecked + ' ' + isdisableactive + '> <span class="slideon-slider"></span></label >';

                            sthtml += `<button class="icon-param-delete btn btn-link" data-id="${subitems.id}" name="isdelete" ${isdisabledelete}><i class="fa fa-trash"></i></button>`;

                            sthtml += '</div>';

                            ihtml += '<tr style="background-color: #f2f4f6;">' +
                                `<td style="padding-left:35px">${docname}</td>` +
                                `<td>${formattedDate} WIB</td>` +
                                `<td>${subitems.fileName}</td>` +
                                `<td>${versiondoc}</td>` +
                                `<td>${totaluang}</td>` +
                                `<td>${bgisactive}</td>` +
                                `<td>${sthtml}</td>` +
                                '</tr>';

                            subloop++;
                        }
                    }
                }
                ihtml += '</table>';

                row.child(ihtml).show();

                $('.incheck').change(function () {
                    var checkbox = $(this);
                    var ischeck = $(this).prop('checked');
                    if (isvalidatepoa) {
                        var rowattach = checkbox.closest('tr');
                        var statusCell = rowattach.find('.statusattach');
                        var checkboxId = $(this).attr('id');
                        var documentType = $(this).attr('value');

                        var reqBody = {
                            'TxtGUI_trUserLogin': txtGui,
                            'TxtUserID': TxtUserId,
                            'IntCabangID': IntCabangId,
                            'IntCabangPrimaryID': IntCabangId,
                            'DocumentGeneralType': documentType,
                            'StatusActive': ischeck,
                            'UpdatedId': checkboxId
                        };

                        $.ajax({
                            url: urlApiGlobal + '/promotion/attachment/updatestatusattachment',
                            type: "POST",
                            data: JSON.stringify(reqBody),
                            headers: {
                                "Authorization": "Bearer " + AccessToken
                            },
                            dataType: "json",
                            contentType: "application/json",
                            success: function (response) {
                                if (response.code == 200) {
                                    if (checkbox.is(':checked')) {
                                        statusCell.removeClass('badge-nonactive').addClass('badge-active');
                                        statusCell.text('Active');
                                    } else {
                                        statusCell.removeClass('badge-active').addClass('badge-nonactive');
                                        statusCell.text('Non Active');
                                    }

                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Status change successful!',
                                        showConfirmButton: false,
                                        text: 'We have saved your data',
                                        allowOutsideClick: false,
                                        allowEscapeKey: false,
                                        timer: 3000
                                    });
                                    let html = '<div style="text-align: center;">' +
                                        '<i class="fa fa-spinner fa-spin fa-2x fa-fw"></i><br /><span>Loading...</span>' +
                                        '</div>';
                                    row.child(html).show();
                                    showAttachment(row);
                                }
                                else {
                                    Swal.fire({
                                        icon: 'error',
                                        title: 'Status change failed!',
                                        showConfirmButton: false,
                                        text: 'We cannot saved your data',
                                        allowOutsideClick: false,
                                        allowEscapeKey: false,
                                        timer: 3000
                                    });

                                    checkbox[0].checked = !ischeck;
                                }
                            },
                            failure: function (response) {
                                console.log(response.d);
                            },
                            error: function (response) {
                                Swal.fire({
                                    icon: 'error',
                                    title: 'Status change failed!',
                                    showConfirmButton: false,
                                    text: 'We cannot saved your data',
                                    allowOutsideClick: false,
                                    allowEscapeKey: false,
                                    timer: 3000
                                });

                                checkbox[0].checked = !ischeck;
                            }
                        });
                    }
                    else {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Failed!',
                            showConfirmButton: true,
                            text: iserrormsg,
                            allowOutsideClick: false,
                            allowEscapeKey: false
                        });
                        console.log(`incheck ${ischeck}`)
                        checkbox[0].checked = !ischeck;
                    }
                });
            }
            else {
                let errhtml;
                errhtml = '<div style="text-align: center;">' +
                    '<i class="fa fa-warning"></i><span> Data gagal untuk dimuat</span>' +
                    '</div>';
                row.child(errhtml).show();
            }
        },
        failure: function (response, message) {
            alert(message);
        },
        error: function (response, message) {
            alert(message);
        }
    });
    
}

$(document).on('click', '[name="isdelete"]', function () {
    let idparam = $(this).data('id');
    $('#deleteModal').modal('show');
    $("#hdnIdParam").val(idparam);
});

$("#btnDelete").click(function () {
    $('#deleteModal').modal('hide');
    var formData = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'AttachmentId': $("#hdnIdParam").val()
    };
    $.ajax({
        url: urlApiGlobal + '/promotion/attachment/deleteattachmentpaidtocms',
        type: 'POST',
        data: JSON.stringify(formData),
        dataType: "json",
        timeout: 15000,
        contentType: "application/json",
        headers: {
            "Authorization": "Bearer " + AccessToken
        },
        success: function (response) {
            if (response.code == 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Document has been deleted',
                    showConfirmButton: false,
                    text: 'We have delete your data',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 4000
                })
                showAttachment(rowchild);
            }
            else {
                Swal.fire({
                    icon: 'error',
                    title: "Document can't deleted",
                    showConfirmButton: true,
                    text: 'Failed to delete document',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                })
            }
        },
        error: function (xhr, textStatus, errorThrown) {
            Swal.fire({
                icon: 'error',
                title: "Document can't deleted",
                showConfirmButton: true,
                text: textStatus,
                allowOutsideClick: false,
                allowEscapeKey: false,
            })
        }
    });
});

function formatUang(angka) {
    return new Number(angka).toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR'
    });
}

function getTotal(plandata) {
    var reqBody = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'PoaNo': gpoa,
        'PaidToId': goutlet
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
            let total = 0;
            if (response.code == 200) {
                let data = response.obj;
                for (var item of data) {
                    if (item.attachmentDocumentDetails == null || item.attachmentDocumentDetails.length == 0) {

                    }
                    else {
                        let docdata;
                        docdata = item.attachmentDocumentDetails;
                        for (var subitems of docdata) {
                            if (subitems.isActive) {
                                total += subitems.subTotal;
                            }
                        }
                    }
                }
                plandata[0].Total = total;
                tableSupportingDoc(plandata);
            }
            else {
                console.log('error');
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

$(document).on('click', '[name="downloaddata"]', function () {
    let filename = $(this).data('filename');
    let resourceid = $(this).data('resourceid');
    var formDownload = {
        'TxtGUI_trUserLogin': txtGui,
        'TxtUserID': TxtUserId,
        'IntCabangID': IntCabangId,
        'IntCabangPrimaryID': IntCabangId,
        'ResourceId': resourceid
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
        success: function (data) {
            var a = document.createElement('a');
            var url = window.URL.createObjectURL(data);
            a.href = url;
            a.download = filename;
            document.body.append(a);
            a.click();
            a.remove();
            //window.URL.revokeObjectURL(url);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("catch");
            console.log(textStatus);

        }
    });
});

$(document).on('click', '[name="viewdata"]', function () {
    let filename = $(this).data('filename');
    let resourceid = $(this).data('resourceid');
    if (filename == '' || filename == null) {
        Swal.fire({
            icon: 'error',
            title: "Tidak ada file yang bisa ditampilkan",
            showConfirmButton: true,
            allowOutsideClick: true,
            allowEscapeKey: false
        })
    }
    else {
        const divView = document.getElementById("divpdf");
        var formDownload = {
            'TxtGUI_trUserLogin': txtGui,
            'TxtUserID': TxtUserId,
            'IntCabangID': IntCabangId,
            'IntCabangPrimaryID': IntCabangId,
            'ResourceId': resourceid
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
            success: function (data) {
                $('#pdfModal').modal('show');

                const file = new File([data], 'attach.pdf', { type: data.type });
                let isFile = file;
                const reader = new FileReader();
                let parts = filename.split('.');
                let format = parts[parts.length - 1];
                if (format.toLowerCase() == 'pdf') {
                    $("#modalTitle").text('PDF Viewer');
                    reader.onload = function (event) {
                        const base64PDF = event.target.result.split(',')[1];

                        const embedElement = document.createElement("embed");
                        embedElement.setAttribute("src", "data:application/pdf;base64," + base64PDF);
                        embedElement.setAttribute("type", "application/pdf");
                        embedElement.setAttribute("width", "100%");
                        embedElement.setAttribute("height", "600");

                        divView.innerHTML = ""; // Bersihkan isi div sebelum menambahkan elemen embed
                        divView.appendChild(embedElement);
                    };
                }
                else {
                    $("#modalTitle").text('Image Viewer');
                    reader.onload = function (event) {
                        const base64Image = event.target.result;

                        const imgElement = document.createElement("img");
                        imgElement.setAttribute("src", base64Image);
                        imgElement.setAttribute("width", "100%");

                        divView.innerHTML = ""; // Bersihkan isi div sebelum menambahkan elemen gambar
                        divView.appendChild(imgElement);
                    };
                }

                reader.readAsDataURL(isFile);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("catch");
                console.log(textStatus);

            }
        });
    }
});

$(document).on('click', '[name="uploadparam"]', function () {
    let planid = $(this)[0].id;
    if (poaisedit) {
        if (planid != null && planid != '') {
            if (isvalidatepoa) {
                $('#uploadModal').modal('show');
                kategori = planid;
            }
            else {
                Swal.fire({
                    icon: 'warning',
                    title: 'Failed!',
                    showConfirmButton: true,
                    text: iserrormsg,
                    allowOutsideClick: false,
                    allowEscapeKey: false
                })
            }
        }
    }
});

window.addEventListener("load", () => {
    const input = document.getElementById("files");

    input.addEventListener("change", (e) => {
        let fileName = e.target.files[0].name;
        $("#titledoc").text(fileName);

        if (e.target.files.length == 0) {
            $("#btnSave").prop('disabled', true);
        }
        else {
            $("#btnSave").prop('disabled', false);
        }
    })
});

function saveData() {
    const fileInput = document.getElementById('files');
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
        formData.append('PoaActivityPlanId', activityplanid);
        formData.append('ActivityPlanDocId', kategori);
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
                    setTimeout(function () { window.location.reload(); }, 3000);
                }
                else {
                    Swal.fire({
                        icon: 'error',
                        title: "Document can't been saved",
                        showConfirmButton: false,
                        text: 'Failed to save document',
                        allowOutsideClick: false,
                        allowEscapeKey: false,
                        timer: 5000
                    })
                    setTimeout(function () { window.location.reload(); }, 4000);
                }
            },
            error: function (xhr, textStatus, errorThrown) {
                Swal.fire({
                    icon: 'error',
                    title: "Document can't been saved",
                    showConfirmButton: false,
                    text: textStatus,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    timer: 5000
                })
                setTimeout(function () { window.location.reload(); }, 4000);
            }
        });
    }
}

$('#btnSave').on('click', function () {
    $('#saveModal').modal('hide');
    saveData();
});