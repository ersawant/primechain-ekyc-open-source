const notificationConfig = require("../configs/notification_config");

class NotificationEngine {

    constructor(app_dir, email_api_key, product_name) {
        this.base_url = `http://${notificationConfig.IP_ADDRESS}:${notificationConfig.LISTEN_PORT}` + app_dir;
        this.product_name = product_name;
        this.sgMail = require("@sendgrid/mail");
        this.sgMail.setApiKey(email_api_key);
       
        this.sg_emptyrequest = {
            to: [],
            from: "",
            subject: "",
            html: ""
        };

        this.email_top = `<html><body>
        <table style='background-color: #dcecf6; width: 100%; border: 0; padding: 0px 30px 0px 30px;'>
            <tr>
                <td>
                    <table style='margin-left: auto; margin-right: auto; width: 600px; border: 0;'>
                        <tr>
                            <td>
                            </td>
                        </tr>
                        <tr>
                        <td style='padding: 30px; background-color: #FFF; text-align: left; border: 0; font-size: 16px; font-family: Georgia; color: #181818;'>`;

        this.email_bottom = `<p>Have an amazing day!<br/>Team Primechain</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style='padding-top: 30px; text-align: center; font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #999;'>This is an automated transactional email sent from ${this.product_name}<br/>&nbsp;
                </td>
            </tr>
        </table></body></html>`;
    }

    /*******************************************************************************************************************
    Send Email Notification
    *******************************************************************************************************************/
    sendEmailNotification(from_address, to_list, subject, body, cc_list, bcc_list, callback) {
        let to_email = [];

        if (to_list && to_list.length) {
            for (var i = 0, j = to_list.length; i < j; i++) {
                if (to_list[i].trim() !== "")
                    to_email.push({ email: to_list[i].trim() });
            }
        }

        if (!to_email && !to_email.length) {
            throw Error("To email cannot be empty");
        }

        let sg_reqdata = this.sg_emptyrequest;
        sg_reqdata.to = to_email;
        sg_reqdata.subject = subject.trim();
        sg_reqdata.from = from_address;
        sg_reqdata.html = this.email_top + body.trim() + this.email_bottom;

        if (cc_list && cc_list.length) {
            let cc_email = [];
            for (var i = 0, j = cc_list.length; i < j; i++) {
                if (cc_list[i].trim() !== "")
                    cc_email.push({ email: cc_list[i].trim() });
            }

            if (cc_email && cc_email.length)
                sg_reqdata["cc"] = cc_email;
        }

        if (bcc_list && bcc_list.length) {
            let bcc_email = [];
            for (var i = 0, j = bcc_list.length; i < j; i++) {
                if (bcc_list[i].trim() !== "")
                    bcc_email.push({ email: bcc_list[i].trim() });
            }

            if (bcc_email && bcc_email.length)
                sg_reqdata["bcc"] = bcc_email;
        }

        this.sgMail.send(sg_reqdata, (err, email_sent) => {
            if (err) { return callback(err, null); }
            else { callback(null, true); }
        });
    }
    
    /*******************************************************************************************************************
    Send activation Email
    *******************************************************************************************************************/
    sendActivationEmail(user_email, user_name, user_designation, organization, random, callback) {
        let activateUserUrl = `${this.base_url}/user_activate?user_email=${user_email}&random=${random}`;
        let subject = `Account activation <> ${user_name}`;
        let from_address = { name: `${notificationConfig.PRODUCT_NAME}`, email: "info@primechain.in" };

        let email_body = `<p>Hi ${user_name}!<br/><br/>Welcome to ${this.product_name}. Your details are:</p>
                            <table rules='all' style='border-color: #dfd9c2;' cellpadding=10>
                                <tr><td>Name:</td><td>${user_name}</td></tr>
                                <tr><td>Designation:</td><td>${user_designation}</td></tr>
                                <tr><td>Organization:</td><td>${organization}</td></tr>
                            </table>
                        <p>If the details are correct, click the 'Activate account' button below and your login credentials will be emailed to you.</p>
                        <p style='padding:3px;'><br/><a href=${activateUserUrl} style='font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #ffffff; font-weight: bold; border-radius: 6px; background: #427db5; border-style:solid; border-color:#417db4; border-width:1px; text-align:center; padding-top:11px; padding-bottom:11px; padding-left:22px; padding-right:22px; text-decoration: none; border-top-color:#417db4; border-bottom-color:#9A6E19; border-left-color:#C59B29; border-right-color:#C59B29;'>Activate account</a><br/>&nbsp;<br/>&nbsp;</p>
                        <p>If you are unable to click the button above, copy paste this link in your browser and press Enter: ${activateUserUrl}</p><br/>
                        `;
        this.sendEmailNotification(from_address, [user_email], subject, email_body, null, null, (err, email_sent) => {
            if (err) { return callback(err, null); }
            else { callback(null, true); }
        });
    }

    /*******************************************************************************************************************
    Send login credentials
    *******************************************************************************************************************/
    sendLoginCredentials(user_email, user_name, user_password, callback) {
        let subject = `Login Credentials <> ${user_name}`;
        let from_address = { name: `${notificationConfig.PRODUCT_NAME}`, email: "info@primechain.in" };

        let email_body = `<p>Hi ${user_name}!<br/><br/>This is what you need to login to ${this.product_name}:</p>
        <table rules='all' style='border-color: #dfd9c2;' cellpadding=10>
            <tr><td>Email:</td><td>${user_email}</td></tr>
            <tr><td>Password:</td><td>${user_password}</td></tr>
            <tr>
                <td>Login at:</td><td><a href='${this.base_url}'>${this.base_url}</a>
            </td>
        </tr>
        </table><br/><br/>`;

        this.sendEmailNotification(from_address, [user_email], subject, email_body, null, null, (err, is_sent) => {
            if (err) { return callback(err, null); }
            else { callback(null, true); }
        });
    }

    /*******************************************************************************************************************
    Send Email Notification
    *******************************************************************************************************************/
    sendLoginNotification(user_name, user_email, ip, browser, callback) {

        let subject = `Login from <> ${ip}`;
        let from_address = { name: `${notificationConfig.PRODUCT_NAME}`, email: "info@primechain.in" };

        let email_body = `
			<p>Hi ${user_name},<br/><br/>There has been a successful login into your ${this.product_name} account. The details are:</p>
							<table rules='all' style='border-color: #dfd9c2;' cellpadding=10>
								<tr><td>Email:</td><td>${user_email}</td></tr>
								<tr><td>IP address:</td><td>${ip}</td></tr>
								<tr><td>Browser:</td><td>${browser}</td></tr>
							</table>
							<p><br/>If you have initiated this login, you can safely ignore this email. <br/><br/><strong>If you have not initiated this login, someone has just accessed your account without authorization. Please take appropriate action immediately.</strong></p>
							`;

        this.sendEmailNotification(from_address, [user_email], subject, email_body, null, null, (err, is_sent) => {
            if (err) { return callback(err, null); }
            else { callback(null, true); }
        });
    }

    /*******************************************************************************************************************
    Send password reset email
    *******************************************************************************************************************/
    sendPasswordResetEmail(user_email, user_name, random, callback) {
        let subject = "Password reset instructions";
        let from_address = { name: `${notificationConfig.PRODUCT_NAME}`, email: "info@primechain.in" };

        let email_body = `<p>Hi ${user_name}!<br/><br/>A password reset has been initiated for your ${this.product_name} account. To reset your password, <a href='${this.base_url}/reset_password?user_email=${user_email}&random=${random}'>click here</a>.<br/></p><p><strong>If you have not initiated this request, simply delete this email.</strong></p>
        `;

        this.sendEmailNotification(from_address, [user_email], subject, email_body, null, null, (err, is_sent) => {
            if (err) { return callback(err, null); }
            else { callback(null, true); }
        });
    }
}

module.exports = new NotificationEngine(notificationConfig.APP_DIR, notificationConfig.SENDGRID_API_KEY, notificationConfig.PRODUCT_NAME);
