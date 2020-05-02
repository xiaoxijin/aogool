<?php
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

namespace crmeb\services;

use Qcloud\Sms\SmsSingleSender;

class QQSMS {

    public static function sendCode($phone, $code) {
        $appid = "1400363113";
        $appkey = "2d7b161c6d02dba5b519ffbc73650dda";
        $smsSign = "aogool";
        $templateId ="595776";

        try {
            $ssender = new SmsSingleSender($appid, $appkey);
            $params = [$code];
            $result = $ssender->sendWithParam("86", $phone, $templateId,
                    $params, $smsSign, "", "");
            $rsp = json_decode($result);
            //echo $result;
            return true;
        } catch (\Exception $e) {
            echo var_dump($e);
        }
    }

}
