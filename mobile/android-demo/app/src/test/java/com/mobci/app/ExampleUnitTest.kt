package com.mobci.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ExampleUnitTest {

    @Test
    fun applicationNameIsCorrect() {
        val applicationName = "MobCI Android"
        assertEquals("MobCI Android", applicationName)
    }

    @Test
    fun applicationVersionIsValid() {
        val versionCode = 1
        assertTrue(versionCode > 0)
    }

    @Test
    fun applicationPackageIsCorrect() {
        val packageName = "com.mobci.app"
        assertEquals("com.mobci.app", packageName)
    }
}