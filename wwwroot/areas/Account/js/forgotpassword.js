$(function () {
    $("#forgotForm").validate({
        rules: {
            nik: "required",
        },
        messages: {
            nik: "NIK is required",
        },
        errorPlacement: function (label, element) {
            label.addClass('mt-2 text-danger');
            label.insertAfter(element);
        },
        highlight: function (element, errorClass) {
            $(element).parent().addClass('has-danger')
            $(element).addClass('form-control-danger')
        }
    });
});

$("#forgotForm").on("submit", function (event) {
    $("#btnForgot").prop('disabled', true);
    event.preventDefault();
    if ($("#forgotForm").valid()) {
        localStorage.clear();
        var dataSource;
        var dataObject = {
            'TxtNik': $("#nik").val()
        };
        $.ajax({
            url: urlApiGlobal + '/apigateway/forgotpassword',
            type: "POST",
            data: JSON.stringify(dataObject),
            dataType: "json",
            contentType: "application/json",
            success: function (res) {
                var jsonString = JSON.stringify(res);
                if (res.code == 200) {
                    var sucMessage = res.message;
                    if (sucMessage != "") {
                        $("#successCard").removeAttr('hidden');
                        $("#alertLock").attr("hidden", true);
                        $("#sucMessage").text(sucMessage);
                    }
                }
                else {
                    var errMessage = res.message;
                    if (errMessage != "") {
                        $("#alertLock").removeAttr('hidden');
                        $("#successCard").attr("hidden", true);
                        $("#errMessage").text(errMessage);
                    }
                }
                $("#btnForgot").prop('disabled', false);
            },
            error: function (xhr, textStatus, errorThrown) {
                if (errMessage != "") {
                    $('#alertLock').removeAttr('hidden');
                    $("#successCard").attr("hidden", true);
                }
                $("#errMessage").text(textStatus);
                $("#btnForgot").prop('disabled', false);
                //toastr.error(err.responseJSON.message);
            }
        });
    }
    else {
        $("#btnForgot").prop('disabled', false);
    }
});