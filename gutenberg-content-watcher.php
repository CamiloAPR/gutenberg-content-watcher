<?php

/**
 * Plugin Name: Gutenberg Content Watcher
 * Plugin URI:
 * Description:   Smart content watcher for post's content.
 * Version:       1.0.0
 * Author: CamiloAPR
 * Author URI:
 * Text Domain:   gutenberg-content-watcher
 *
 * @package gutenberg-content-watcher
 */

defined('ABSPATH') || die("Can't access directly");

class GCW {
    public static $plugin_data = NULL;
    public static $base_url = NULL;
    public static $version = NULL;
    protected static $_instance = null;


    public static function instance() {
        if (is_null(self::$_instance))
          self::$_instance = new self();
        return self::$_instance;
    }

    public static function init() {
        self::$plugin_data = get_file_data(__FILE__, array('Version' => 'Version','TextDomain' => 'gcw'), 'plugin');
        self::$version = self::$plugin_data['Version'];
        self::$base_url = plugin_dir_url(__FILE__);

        add_action('init', 'GCW::instance', 0);
    }

    public function __construct() {
        add_action('enqueue_block_editor_assets', array($this, 'gcw_enqueue_assets'));
    }

    public function gcw_enqueue_assets() {
        $types = array('post', 'page');
        $types =  apply_filters('gcw_post_types', $types);
        if (in_array(get_post_type(), $types)) {
            $asset_file = include(plugin_dir_path(__FILE__) . '/dist/gcw-editor.asset.php');
            wp_enqueue_script('gcw-editor', self::$base_url . '/dist/gcw-editor.js', $asset_file['dependencies'], $asset_file['version']);
            wp_enqueue_style('gcw-styles', self::$base_url . '/style.css', array(), self::$version);
        }
    }
}


if (class_exists('GCW')) {
    GCW::init();
}