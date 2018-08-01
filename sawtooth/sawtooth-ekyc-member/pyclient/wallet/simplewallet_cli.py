import argparse
import getpass
import logging
import os
import sys
import traceback
import pkg_resources

from colorlog import ColoredFormatter

from wallet.simplewallet_client import SimpleWalletClient

DISTRIBUTION_NAME = 'simplewallet'

DEFAULT_URL = 'http://localhost:8008'

def create_console_handler(verbose_level):
    clog = logging.StreamHandler()
    formatter = ColoredFormatter(
        "%(log_color)s[%(asctime)s %(levelname)-8s%(module)s]%(reset)s "
        "%(white)s%(message)s",
        datefmt="%H:%M:%S",
        reset=True,
        log_colors={
            'DEBUG': 'cyan',
            'INFO': 'green',
            'WARNING': 'yellow',
            'ERROR': 'red',
            'CRITICAL': 'red',
        })

    clog.setFormatter(formatter)
    clog.setLevel(logging.DEBUG)
    return clog

def setup_loggers(verbose_level):
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    logger.addHandler(create_console_handler(verbose_level))

def add_kyc_category_parser(subparsers, parent_parser):
    parser = subparsers.add_parser(
        'kycCategory',
        help='adds kyc categories to blockchain',
        parents=[parent_parser])

    parser.add_argument(
        'value',
        type=str,
        help='json data in string')

    parser.add_argument(
        'userName',
        type=str,
        help='user name')

    parser.add_argument(
        'kycCategoryAddress',
        type=str,
        help='address on the blockchain')

def create_parent_parser(prog_name):
    parent_parser = argparse.ArgumentParser(prog=prog_name, add_help=False)

    try:
        version = pkg_resources.get_distribution(DISTRIBUTION_NAME).version
    except pkg_resources.DistributionNotFound:
        version = 'UNKNOWN'

    parent_parser.add_argument(
        '-V', '--version',
        action='version',
        version=(DISTRIBUTION_NAME + ' (Hyperledger Sawtooth) version {}')
        .format(version),
        help='display version information')

    return parent_parser


def create_parser(prog_name):
    parent_parser = create_parent_parser(prog_name)

    parser = argparse.ArgumentParser(
        description='Provides subcommands to manage your sawtooth ekyc',
        parents=[parent_parser])

    subparsers = parser.add_subparsers(title='subcommands', dest='command')

    subparsers.required = True

    add_kyc_category_parser(subparsers, parent_parser)
    return parser    

def _get_keyfile(userName):
    home = os.path.expanduser("~")
    key_dir = os.path.join(home, "sawtooth", "sawtooth-ekyc-member", "jsclient", "keys")

    return '{}/{}.priv'.format(key_dir, userName)

def _get_pubkeyfile(userName):
    home = os.path.expanduser("~")
    key_dir = os.path.join(home, "sawtooth", "sawtooth-ekyc-member", "jsclient", "keys")

    return '{}/{}.pub'.format(key_dir, userName)

def do_add_kyc_category(args):
    keyfile = _get_keyfile(args.userName)

    client = SimpleWalletClient(baseUrl=DEFAULT_URL, keyFile=keyfile)

    response = client.add_kyc(args.value, args.kycCategoryAddress)

    print("Response: {}".format(response))

def main(prog_name=os.path.basename(sys.argv[0]), args=None):
    if args is None:
        args = sys.argv[1:]
    parser = create_parser(prog_name)
    args = parser.parse_args(args)

    verbose_level = 0

    setup_loggers(verbose_level=verbose_level)

    # Get the commands from cli args and call corresponding handlers
    if args.command == 'kycCategory':
        do_add_kyc_category(args)
    else:
        raise Exception("Invalid command: {}".format(args.command))

def main_wrapper():
    try:
        main()
    except KeyboardInterrupt:
        pass
    except SystemExit as err:
        raise err
    except BaseException as err:
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
