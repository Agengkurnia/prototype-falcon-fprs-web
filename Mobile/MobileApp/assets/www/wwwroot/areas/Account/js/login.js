$(document).ready(function () {
    console.log(urlApiGlobal);
    var storedJsonString = localStorage.getItem("dataLogin");
    var storedData = JSON.parse(storedJsonString);

});
$(function () {
    $("#loginForm").validate({
        rules: {
            username: "required",
            password: "required",
        },
        messages: {
            username: "Username is required",
            password: "Password is required",
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
$("#loginForm").on("submit", function (event) {
    var url = "/PlanofActivity/PoA";
    $("#btnLogin").prop('disabled', true);
    event.preventDefault();
    if ($("#loginForm").valid()) {
        localStorage.clear();
        var dataSource;
        var dataObject = {
            'userName': $("#username").val(),
            'password': $("#password").val(),
            'deviceId': 'ce75ea7f-0504-409d-8f8b-1245ebf8b3b5',
            'deviceModel': 'web',
            'appVersion': '1.0.0'
        };
        $.ajax({
            url: urlApiGlobal + '/apigateway/login',
            type: "POST",
            data: JSON.stringify(dataObject),
            dataType: "json",
            timeout: 25000,
            contentType: "application/json",
            success: function (res) {
                var jsonString = JSON.stringify(res);
                var dataToSend = {
                    myValue: jsonString
                };
                if (res.code == 200) {
                    var retvalData = res.obj;
                    if (retvalData != null) {
                        $.ajax({
                            type: "POST",
                            data: dataToSend,
                            url: "/Account/Login/Login",
                            success: function (data) {
                                console.log("berhasil login");
                                console.log(data);
                                localStorage.setItem("dataLogin", jsonString);
                                window.location.href = data;
                            },
                            error: function (xhr, status, error) {
                                window.location.href = "/Account/Account/AccessDenied";
                            }
                        });
                        
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
                $("#btnLogin").prop('disabled', false);
            },
            error: function (xhr, textStatus, errorThrown) {
                console.log("catch");
                console.log(textStatus);
                if (errMessage != "") {
                    $('#alertLock').removeAttr('hidden');
                }
                $('#errMessage').text(textStatus);
                if (textStatus == 'timeout') {
                    $('#errMessage').text("Request Timeout");
                }
                $("#btnLogin").prop('disabled', false);
                //toastr.error(err.responseJSON.message);
            }
        });
    }
    else {
        $("#btnLogin").prop('disabled', false);
    }
});

toastr.options = {
    "closeButton": true,
    "positionClass": "toast-bottom-right",
    "preventDuplicates": false,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
};
const passwordField = document.querySelector("#password");
eye.addEventListener("click", function () {
    //this.classList.toggle("typcn-eye-outline");
    const type = passwordField.getAttribute("type") === "password" ? "text" : "password";
    passwordField.setAttribute("type", type);
})