<?php 
$callbackId = $_GET['id'];
if (isset($_FILES['myfile']))  {
    if ($_FILES['myfile']["error"] > 0) {
        echo '<script>window.parent.jQuery.uploader.list["' . $callbackId . '"].error("Return Code: ' . $_FILES['myfile']["error"] . '");</script>';
    } else {
        $info = pathinfo($_FILES['myfile']["name"]);
        $id = uniqid();
        $name = dirname(__FILE__) . '\\' . $id . '.' . $info['extension'];
        move_uploaded_file($_FILES['myfile']["tmp_name"], $name);
        echo '<script>window.parent.jQuery.uploader.list["' . $callbackId . '"].success({id: "' . $id . '", fileName: "' . $_FILES['myfile']["name"] . '", fileSize: "' . $_FILES['myfile']["size"] . '", ext: "' . $info['extension'] . '"});</script>';
    }
} else { 
    echo '<script>window.parent.jQuery.uploader.list["' . $callbackId . '"].error("Invalid file");</script>';
}