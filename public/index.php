<?php

declare(strict_types=1);

use App\Kernel;
use Laminas\HttpHandlerRunner\Emitter\SapiEmitter;

require dirname(__DIR__) . '/vendor/autoload.php';

$kernel = new Kernel(dirname(__DIR__));

(new SapiEmitter())->emit($kernel->handle());
