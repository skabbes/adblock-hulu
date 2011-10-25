import xml.dom.minidom
from glob import glob
from functools import reduce

import os
import shutil
import zipfile

def updateInstallRDF():
    def toInt(a): return int(a)
    def combineWithDot(a, b): return str(a) + "." + str(b)

    doc = xml.dom.minidom.parse("install.rdf")

    nodes = doc.getElementsByTagName("em:version")
    version = nodes[0].firstChild.nodeValue
    version = version.split(".")
    version = list(map(toInt, version))

    # increment the build number
    version[len(version) - 1] = int(version[len(version) - 1]) + 1
    version = reduce(combineWithDot, version)

    # reassign the version number
    nodes[0].firstChild.nodeValue = version

    file_object = open("install.rdf", "w")
    doc.writexml(file_object)

def getVersion():
    doc = xml.dom.minidom.parse("install.rdf")
    nodes = doc.getElementsByTagName("em:version")
    return nodes[0].firstChild.nodeValue

def getMinVersion():
    doc = xml.dom.minidom.parse("install.rdf")
    nodes = doc.getElementsByTagName("em:minVersion")
    return nodes[0].firstChild.nodeValue

def getMaxVersion():
    doc = xml.dom.minidom.parse("install.rdf")
    nodes = doc.getElementsByTagName("em:maxVersion")
    return nodes[0].firstChild.nodeValue

def deleteOldBuild():
    for file in glob("adblock-hulu*.xpi"):
        os.remove(file)
    shutil.rmtree("build", True)

def makeUpdateRDF():
    doc = xml.dom.minidom.parse("update.rdf")

    nodes = doc.getElementsByTagName("em:version")
    nodes[0].firstChild.nodeValue = getVersion()

    nodes = doc.getElementsByTagName("em:minVersion")
    nodes[0].firstChild.nodeValue = getMinVersion()

    nodes = doc.getElementsByTagName("em:maxVersion")
    nodes[0].firstChild.nodeValue = getMaxVersion()

    file_object = open("update.rdf" , "w")
    doc.writexml(file_object)

def setupNewBuild():
    os.mkdir("build")

def compile():
    shutil.copyfile("install.rdf", os.path.join("build", "install.rdf") )
    shutil.copyfile("chrome.manifest", os.path.join("build", "chrome.manifest") )
    shutil.copytree("defaults", os.path.join("build", "defaults") )
    shutil.copytree("chrome", os.path.join("build", "chrome") )
    shutil.copytree("modules", os.path.join("build", "modules") )

def package():
    file = zipfile.ZipFile("adblock-hulu.xpi", "w")
    startpath = os.path.basename("build")
    for (path, dirs, files) in os.walk("build"):
        for name in files:
            fullpath = os.path.join(path, name)
            file.write(fullpath, os.path.relpath(fullpath, startpath), zipfile.ZIP_DEFLATED)
    file.close()
    
deleteOldBuild()
setupNewBuild()
updateInstallRDF()
makeUpdateRDF()
compile()
package()
