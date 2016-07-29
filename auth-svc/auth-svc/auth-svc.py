from bottle import Bottle, run, request
import logging
import pymysql
import os
import time

LISTEN_PORT = 8081


# create logger with 'auth-svc'
logger = logging.getLogger('auth-svc')
logger.setLevel(logging.DEBUG)
logger.propagate = False
# create file handler which logs even debug messages
#fh = logging.FileHandler('auth-svc.log')
#fh.setLevel(logging.DEBUG)
# create console handler with a higher log level
ch = logging.StreamHandler()
ch.setLevel(logging.DEBUG)
# create formatter and add it to the handlers
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
#fh.setFormatter(formatter)
ch.setFormatter(formatter)
# add the handlers to the logger
#logger.addHandler(fh)
logger.addHandler(ch)


mysql_config = {
    'host': os.environ['MYSQL_ENDPOINT'],
    'user': os.environ['MYSQL_USER'],
    'passwd': os.environ['MYSQL_PASSWORD'],
    'db': os.environ['MYSQL_DATABASE']
}

app = Bottle()


def init_db():
    logger.info('Processing init database')
    time.sleep(30)

    try:
        cnx = pymysql.connect(**mysql_config)
        cursor = cnx.cursor()
        
        #create_db = "create database if not exists spi"
        #cursor.execute(create_db)
        #cursor.close()

        create_table = "create table if not exists spi.users(username varchar(50), password varchar(50))"
        cursor.execute(create_table)
        cursor.close()

    except pymysql.Error as err:
        msg = "Failed init database: {}".format(err)
        logger.error(msg)
    finally:
        cnx.close()

    return


@app.route('/test', method='GET')
def get_test():
    logger.info('Processing GET /test')
    retdata = {
        "status": "OK"
    }
    return retdata


@app.route('/login', method='POST')
def post_login():
    logger.info('Processing POST /login')
    data = request.json
    logger.info(data)
    username = data["username"]
    password = data["password"]

    try:
        cnx = pymysql.connect(**mysql_config)
        cursor = cnx.cursor()
        select_user = "SELECT count(*) FROM users WHERE username = %s and password = %s"
        data_user = (username, password)
        cursor.execute(select_user, data_user)
        results = cursor.fetchall()
        for row in results:
            if row[0] == 1:
                retdata = {
                    "status": "OK"
                }
                logger.info("Login OK")
            else:
                retdata = {
                    "status": "ERROR"
                }
                logger.info("Login ERROR")
        cursor.close()
    except pymysql.Error as err:
        msg = "Failed to select user: {}".format(err)
        logger.error(msg)
        retdata = {
            "status": "ERROR",
            "message": msg
        }
    finally:
        cnx.close()

    return retdata


@app.route('/register', method='POST')
def post_register():
    logger.info('Processing POST /register')
    data = request.json
    logger.info(data)
    username = data["username"]
    password = data["password"]

    try:
        cnx = pymysql.connect(**mysql_config)
        cursor = cnx.cursor()
        inert_user = "INSERT INTO users (username, password) VALUES (%s, %s)"
        data_user = (username, password)
        cursor.execute(inert_user, data_user)
        cnx.commit()
        cursor.close()
        retdata = {
            "status": "OK"
        }
    except pymysql.Error as err:
        msg = "Failed to register user: {}".format(err)
        logger.error(msg)
        retdata = {
            "status": "ERROR",
            "message": msg
        }
    finally:
        cnx.close()

    return retdata


'''
RUN APP
'''

init_db()
logger.info('Starting Authentication Service on port {0}'.format(LISTEN_PORT))
run(app, host='0.0.0.0', port=LISTEN_PORT, reloader=True)
