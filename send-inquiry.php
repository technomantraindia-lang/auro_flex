<?php
/**
 * Auroflex Engineering - Inquiry Form Handler
 * Uses PHPMailer to send emails via SMTP
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Require PHPMailer files
// Make sure you have downloaded PHPMailer and placed it in the 'phpmailer' folder
require 'phpmailer/Exception.php';
require 'phpmailer/PHPMailer.php';
require 'phpmailer/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Get form data
    $name         = strip_tags(trim($_POST["name"]));
    $company      = strip_tags(trim($_POST["company"]));
    $phone        = strip_tags(trim($_POST["phone"]));
    $email        = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $product_type = strip_tags(trim($_POST["product_type"]));
    $message      = strip_tags(trim($_POST["message"]));

    // Check required fields
    if (empty($name) || empty($email) || empty($phone)) {
        echo "Please fill in all required fields.";
        exit;
    }

    $mail = new PHPMailer(true);

    try {
        // --- SMTP SETTINGS (PLACEHOLDERS) ---
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Add SMTP Host here
        $mail->SMTPAuth   = true;
        $mail->Username   = 'vivekpatel2472003@gmail.com';                   // Add SMTP Email ID here
        $mail->Password   = 'lyxiohxgeariabih';                   // Add SMTP Password here
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
        $mail->Port       = 587;

        // --- EMAIL CONTENT ---
        $mail->setFrom('info@auroflex.in', 'Auroflex Website');
        $mail->addAddress('info@auroflex.in'); // Recipient email
        $mail->addReplyTo($email, $name);

        $mail->isHTML(true);
        $mail->Subject = "New Inquiry from " . $name;
        
        $email_body = "
            <div style='font-family: sans-serif; line-height: 1.6; color: #333;'>
                <h2 style='color: #c10000;'>New Website Inquiry</h2>
                <hr>
                <p><strong>Name:</strong> {$name}</p>
                <p><strong>Company:</strong> {$company}</p>
                <p><strong>Email:</strong> {$email}</p>
                <p><strong>Phone:</strong> {$phone}</p>
                <p><strong>Product Type:</strong> {$product_type}</p>
                <p><strong>Message:</strong><br>{$message}</p>
                <hr>
                <p style='font-size: 0.8rem; color: #888;'>This email was sent from the Auroflex Engineering contact form.</p>
            </div>
        ";

        $mail->Body = $email_body;

        $mail->send();
        
        // Redirect on success
        header("Location: contact.html?status=success");
        exit;

    } catch (Exception $e) {
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }

} else {
    // Not a POST request
    header("Location: contact.html");
    exit;
}
?>
