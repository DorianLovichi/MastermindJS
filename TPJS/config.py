import os

class Config:
    SECRET_KEY = 'root'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///mastermind.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
