<?php 
$allowFiles = 'all';
$allowFiles = array('jpg', 'gif', 'png', 'jpeg', 'bmp');
$callbackId = $_GET['id'];
$instance = 'window.parent.jQuery.uploader.list["' . $callbackId . '"]';
if (isset($_FILES['myfile']))  {
    if ($_FILES['myfile']["error"] > 0) {
        echo '<script>' . $instance . '.error("Return Code: ' . $_FILES['myfile']["error"] . '");</script>';
    } else {
        $info = pathinfo($_FILES['myfile']["name"]);
        $ext = strtolower($info['extension']);
        $id = uniqid();
        if ($allowFiles && is_array($allowFiles) && !in_array($ext, $allowFiles)) {
            echo '<script>' . $instance . '.error("This file is not allowed.");</script>';
            exit;
        }
        $name = dirname(__FILE__) . DIRECTORY_SEPARATOR . $id . '.' . $ext;
        /// For SAE only
        if (class_exists('SaeStorage')) {
            $name = 'uploads' . DIRECTORY_SEPARATOR . 'tmp' . DIRECTORY_SEPARATOR . $id . '.' . $ext;
            $storage = new SaeStorage();
            $result = $storage->upload("img", $name, $_FILES['myfile']["tmp_name"]);
            if ($result) {
                echo '<script>' . $instance . '.success({id: "' . $id . '", url: "' . $result . '", name: "' . $_FILES['myfile']["name"] . '", size: "' . $_FILES['myfile']["size"] . '", ext: "' . $ext . '"});</script>';
                exit;
            } else {
                echo '<script>' . $instance . '.error("Failed to upload to storage.");</script>';
                exit;
            }
        }
        if(move_uploaded_file($_FILES['myfile']["tmp_name"], $name)) {
            echo '<script>' . $instance . '.success({id: "' . $id . '", url: "server/' . ($id . '.' . $ext) . '", name: "' . $_FILES['myfile']["name"] . '", size: "' . $_FILES['myfile']["size"] . '", ext: "' . $ext . '"});</script>';
        } else {
            echo '<script>' . $instance . '.error("Can not save the file. Please make sure this directory is writeable.");</script>';
        }
    }
} else { 
    echo '<script>' . $instance . '.error("Invalid file");</script>';
}